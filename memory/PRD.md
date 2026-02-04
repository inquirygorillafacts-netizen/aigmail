# AI-Human Services Platform PRD

## Original Problem Statement
यूजर को एक existing AI-Human Services platform में improvements और new features चाहिए:
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
- **Database:** Firebase (Firestore + Realtime Database)
- **Auth:** Firebase Google Auth

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

## What's Been Implemented (Feb 2026)
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

## Remaining Backlog
### P0 (Critical):
- [ ] Real-time Chat System with Firebase RTDB
- [ ] Customer Chat Page - input box at bottom, hide nav on mobile
- [ ] Customer Services Page - fix like button position

### P1 (Important):
- [ ] AI Employee Page - futuristic UI with 3D/animations
- [ ] Notifications - delete individual, clear all, badge management
- [ ] Payment Receipt download as PNG
- [ ] Owner Dashboard revenue chart
- [ ] Owner Customers Page - full customer details

### P2 (Nice to Have):
- [ ] Owner Control Page - real-time business info sync
- [ ] Customer Onboarding - name, phone, location collection
- [ ] Phone number validation with +91 prefix

## Next Tasks
1. Fix Customer Chat Page layout
2. Implement Real-time Chat with Firebase RTDB
3. Fix Services Page like button overlap
4. Add Liked Services view
