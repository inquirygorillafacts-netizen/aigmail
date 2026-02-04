# AI-Human Services Platform PRD

## Original Problem Statement
यूजर को एक existing AI-Human Services platform में FCM (Firebase Cloud Messaging) complete करना है और not working features को fix करना है:
- FCM Integration complete करें
- PWA Setup with Install button
- Login redirect fix
- Customer Services Page like button fix
- Customer Chat Page input box position fix
- Profile page dedicated sub-pages
- Real-time Chat System
- Owner Dashboard improvements
- Owner Control Page real-time sync
- Customer Onboarding

## Architecture
- **Frontend:** React.js with Tailwind CSS, shadcn/ui components
- **Backend:** FastAPI (Python)
- **Database:** Firebase (Firestore + Realtime Database) + MongoDB
- **Auth:** Firebase Google Auth
- **Push Notifications:** Firebase Cloud Messaging (FCM)

## User Personas
1. **Public Visitor:** Explore services, talk to AI Employee
2. **Customer:** Logged-in user, can request services, chat, pay
3. **Owner:** Admin with full control panel

## Core Requirements
- PWA Support with Install prompts
- Real-time Chat between Customer and Owner
- AI Employee with voice interaction
- Service management with likes feature
- Payment tracking with receipt download
- Push Notifications via FCM

## What's Been Implemented (Feb 2026)

### FCM Integration (Complete):
- [x] Firebase Service Account JSON configured at /app/backend/firebase_config.json
- [x] Backend FCM endpoints:
  - POST /api/fcm/register - Register FCM token
  - DELETE /api/fcm/unregister - Unregister token
  - POST /api/fcm/send - Send notification to user
  - POST /api/fcm/send-topic - Send topic notification
  - POST /api/fcm/subscribe - Subscribe to topic
- [x] Notifications CRUD:
  - GET /api/notifications/{user_id}
  - PUT /api/notifications/{user_id}/read
  - DELETE /api/notifications/{user_id}
  - DELETE /api/notifications/{user_id}/{notification_id}
- [x] Frontend FCMContext for managing notifications
- [x] firebase-messaging-sw.js service worker
- [x] Owner Notifications Page for sending push notifications

### Phase 1 Complete:
- [x] PWA manifest.json and service-worker.js
- [x] PWA icons (72x72 to 512x512)
- [x] InstallBanner and InstallButton components
- [x] PWAContext for install state management
- [x] Header Install button
- [x] Login redirect - authenticated users go to /customer/home
- [x] PublicRoute wrapper - redirects logged users away from public pages
- [x] Customer HelplinePage
- [x] Customer FAQPage
- [x] Customer TermsPage
- [x] Customer PrivacyPage
- [x] Customer SettingsPage
- [x] Profile page links updated to use dedicated pages
- [x] Customer Chat Page with input box at bottom (WhatsApp style)
- [x] Customer Services Page with like button
- [x] Real-time Chat with Firebase RTDB

## Remaining Backlog
### P0 (Critical):
- [ ] Test FCM with real device/browser

### P1 (Important):
- [ ] AI Employee Page - futuristic UI with 3D/animations
- [ ] Payment Receipt download as PNG
- [ ] Owner Dashboard revenue chart
- [ ] Owner Customers Page - full customer details

### P2 (Nice to Have):
- [ ] Owner Control Page - real-time business info sync
- [ ] Customer Onboarding - name, phone, location collection
- [ ] Phone number validation with +91 prefix

## Tech Stack
- React 18 with Create React App + CRACO
- Tailwind CSS + shadcn/ui
- FastAPI (Python)
- MongoDB (for FCM tokens, notifications)
- Firebase (Auth, Firestore, RTDB, Storage)
- Firebase Cloud Messaging

## Next Tasks
1. Test FCM on real browsers with notification permission
2. Add AI Employee page improvements
3. Add payment receipt download feature
