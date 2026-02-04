import requests
import sys
import json
from datetime import datetime

class FCMAPITester:
    def __init__(self, base_url="https://fcm-enhancement.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_id = f"test_user_{datetime.now().strftime('%H%M%S')}"
        self.test_token = f"fake_fcm_token_{datetime.now().strftime('%H%M%S')}"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"   Response: {response.text[:200]}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:500]}")

            return success, response.json() if response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_basic_api(self):
        """Test basic API connectivity"""
        return self.run_test("Basic API", "GET", "api/", 200)

    def test_fcm_register_token(self):
        """Test FCM token registration"""
        data = {
            "user_id": self.test_user_id,
            "token": self.test_token,
            "device_info": "Test Browser"
        }
        return self.run_test("FCM Register Token", "POST", "api/fcm/register", 200, data)

    def test_fcm_send_notification(self):
        """Test sending FCM notification"""
        data = {
            "user_id": self.test_user_id,
            "title": "Test Notification",
            "body": "This is a test notification",
            "data": {"test": "true"}
        }
        return self.run_test("FCM Send Notification", "POST", "api/fcm/send", 200, data)

    def test_fcm_send_topic_notification(self):
        """Test sending topic notification"""
        data = {
            "topic": "general",
            "title": "Topic Test",
            "body": "This is a topic notification",
            "data": {"type": "topic"}
        }
        return self.run_test("FCM Send Topic", "POST", "api/fcm/send-topic", 200, data)

    def test_fcm_subscribe_topic(self):
        """Test subscribing to topic"""
        return self.run_test("FCM Subscribe Topic", "POST", f"api/fcm/subscribe/{self.test_user_id}/general", 200)

    def test_get_notifications(self):
        """Test getting user notifications"""
        return self.run_test("Get Notifications", "GET", f"api/notifications/{self.test_user_id}", 200)

    def test_mark_notifications_read(self):
        """Test marking notifications as read"""
        return self.run_test("Mark Notifications Read", "PUT", f"api/notifications/{self.test_user_id}/read", 200)

    def test_clear_notifications(self):
        """Test clearing all notifications"""
        return self.run_test("Clear Notifications", "DELETE", f"api/notifications/{self.test_user_id}", 200)

    def test_fcm_unregister_token(self):
        """Test FCM token unregistration"""
        return self.run_test("FCM Unregister Token", "DELETE", f"api/fcm/unregister/{self.test_user_id}/{self.test_token}", 200)

def main():
    print("🚀 Starting FCM API Tests...")
    print("=" * 50)
    
    tester = FCMAPITester()
    
    # Test sequence
    tests = [
        ("Basic API Connectivity", tester.test_basic_api),
        ("FCM Token Registration", tester.test_fcm_register_token),
        ("FCM Send Notification", tester.test_fcm_send_notification),
        ("Get User Notifications", tester.test_get_notifications),
        ("FCM Subscribe to Topic", tester.test_fcm_subscribe_topic),
        ("FCM Send Topic Notification", tester.test_fcm_send_topic_notification),
        ("Mark Notifications Read", tester.test_mark_notifications_read),
        ("Clear All Notifications", tester.test_clear_notifications),
        ("FCM Unregister Token", tester.test_fcm_unregister_token),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())