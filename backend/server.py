from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, messaging


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Firebase Admin SDK
firebase_config_path = ROOT_DIR / 'firebase_config.json'
if firebase_config_path.exists() and not firebase_admin._apps:
    cred = credentials.Certificate(str(firebase_config_path))
    firebase_admin.initialize_app(cred)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# FCM Models
class FCMTokenRegister(BaseModel):
    user_id: str
    token: str
    device_info: Optional[str] = None

class FCMNotification(BaseModel):
    user_id: Optional[str] = None
    token: Optional[str] = None
    title: str
    body: str
    data: Optional[dict] = None
    image: Optional[str] = None

class FCMTopicNotification(BaseModel):
    topic: str
    title: str
    body: str
    data: Optional[dict] = None

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ==================== FCM ENDPOINTS ====================

@api_router.post("/fcm/register")
async def register_fcm_token(data: FCMTokenRegister):
    """Register or update FCM token for a user"""
    try:
        doc = {
            "user_id": data.user_id,
            "token": data.token,
            "device_info": data.device_info,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        }
        
        # Upsert - update if exists, insert if not
        await db.fcm_tokens.update_one(
            {"user_id": data.user_id, "token": data.token},
            {"$set": doc},
            upsert=True
        )
        
        return {"success": True, "message": "Token registered successfully"}
    except Exception as e:
        logger.error(f"FCM register error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/fcm/unregister/{user_id}/{token}")
async def unregister_fcm_token(user_id: str, token: str):
    """Unregister FCM token"""
    try:
        await db.fcm_tokens.update_one(
            {"user_id": user_id, "token": token},
            {"$set": {"is_active": False}}
        )
        return {"success": True, "message": "Token unregistered"}
    except Exception as e:
        logger.error(f"FCM unregister error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/fcm/send")
async def send_fcm_notification(data: FCMNotification):
    """Send FCM notification to a specific user or token"""
    try:
        tokens = []
        
        if data.token:
            tokens = [data.token]
        elif data.user_id:
            # Get all active tokens for user
            user_tokens = await db.fcm_tokens.find(
                {"user_id": data.user_id, "is_active": True},
                {"_id": 0, "token": 1}
            ).to_list(100)
            tokens = [t["token"] for t in user_tokens]
        
        if not tokens:
            return {"success": False, "message": "No tokens found"}
        
        # Build notification
        notification = messaging.Notification(
            title=data.title,
            body=data.body,
            image=data.image
        )
        
        # Build message data
        msg_data = data.data or {}
        msg_data["click_action"] = "FLUTTER_NOTIFICATION_CLICK"
        
        success_count = 0
        failure_count = 0
        
        for token in tokens:
            try:
                message = messaging.Message(
                    notification=notification,
                    data={k: str(v) for k, v in msg_data.items()},
                    token=token,
                    webpush=messaging.WebpushConfig(
                        notification=messaging.WebpushNotification(
                            title=data.title,
                            body=data.body,
                            icon="/icons/icon-192x192.png",
                            badge="/icons/icon-72x72.png"
                        ),
                        fcm_options=messaging.WebpushFCMOptions(
                            link="/"
                        )
                    )
                )
                messaging.send(message)
                success_count += 1
            except messaging.UnregisteredError:
                # Token is invalid, mark as inactive
                await db.fcm_tokens.update_one(
                    {"token": token},
                    {"$set": {"is_active": False}}
                )
                failure_count += 1
            except Exception as e:
                logger.error(f"FCM send error for token: {e}")
                failure_count += 1
        
        # Save notification to database
        await db.notifications.insert_one({
            "user_id": data.user_id,
            "title": data.title,
            "body": data.body,
            "data": data.data,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read": False
        })
        
        return {
            "success": True,
            "sent": success_count,
            "failed": failure_count
        }
        
    except Exception as e:
        logger.error(f"FCM send error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/fcm/send-topic")
async def send_topic_notification(data: FCMTopicNotification):
    """Send FCM notification to a topic (all users subscribed)"""
    try:
        notification = messaging.Notification(
            title=data.title,
            body=data.body
        )
        
        message = messaging.Message(
            notification=notification,
            data={k: str(v) for k, v in (data.data or {}).items()},
            topic=data.topic,
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    title=data.title,
                    body=data.body,
                    icon="/icons/icon-192x192.png"
                )
            )
        )
        
        response = messaging.send(message)
        return {"success": True, "message_id": response}
        
    except Exception as e:
        logger.error(f"FCM topic send error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/fcm/subscribe/{user_id}/{topic}")
async def subscribe_to_topic(user_id: str, topic: str):
    """Subscribe user's tokens to a topic"""
    try:
        user_tokens = await db.fcm_tokens.find(
            {"user_id": user_id, "is_active": True},
            {"_id": 0, "token": 1}
        ).to_list(100)
        
        tokens = [t["token"] for t in user_tokens]
        if tokens:
            response = messaging.subscribe_to_topic(tokens, topic)
            return {"success": True, "subscribed": response.success_count}
        return {"success": False, "message": "No tokens found"}
        
    except Exception as e:
        logger.error(f"FCM subscribe error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Notifications CRUD
@api_router.get("/notifications/{user_id}")
async def get_user_notifications(user_id: str):
    """Get all notifications for a user"""
    try:
        notifications = await db.notifications.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return {"notifications": notifications}
    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/notifications/{user_id}/read")
async def mark_notifications_read(user_id: str):
    """Mark all notifications as read"""
    try:
        await db.notifications.update_many(
            {"user_id": user_id},
            {"$set": {"read": True}}
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/notifications/{user_id}")
async def clear_all_notifications(user_id: str):
    """Delete all notifications for a user"""
    try:
        await db.notifications.delete_many({"user_id": user_id})
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()