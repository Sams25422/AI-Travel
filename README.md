# Atlas - Automated Travel Journal

**Codename:** Atlas
**Version:** 0.0.1 (MVP - Initial Setup)
**Status:** 🚧 In Development

## Overview

Atlas is a privacy-first mobile application that automatically tracks your journeys and transforms them into beautiful, tangible memory books. The app runs in the background, using on-device intelligence to build a chronological travel journal without any manual effort.

**Core Value Proposition:** "Set it and forget it. Live your trip. We'll write the journal. You buy the book."

## 📋 Documentation

- [Product Requirements Document (PRD)](./PRD.md)
- [Technical & UX Blueprint](./Blueprint.md)

## 🏗️ Project Structure

```
AI-Travel/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Generic components (buttons, cards, etc.)
│   │   ├── trip/         # Trip-specific components
│   │   └── map/          # Map-related components
│   ├── screens/          # Screen components
│   │   ├── Onboarding/   # Onboarding flow screens
│   │   ├── Home/         # Home/world map screen
│   │   ├── Trip/         # Trip timeline screens
│   │   └── Settings/     # Settings screens
│   ├── navigation/       # React Navigation setup
│   ├── services/         # Core business logic services
│   │   ├── TrackerService.ts      # Location tracking (CRITICAL)
│   │   ├── CurationService.ts     # Photo intelligence
│   │   ├── PermissionService.ts   # Permission management
│   │   └── TripService.ts         # Trip CRUD operations
│   ├── models/           # TypeScript type definitions
│   ├── utils/            # Utility functions & helpers
│   │   ├── storage.ts    # Local storage utilities
│   │   ├── constants.ts  # App-wide constants
│   │   └── helpers.ts    # Helper functions
│   ├── hooks/            # Custom React hooks
│   ├── assets/           # Images, fonts, etc.
│   └── theme/            # Theme configuration
├── ios/                  # iOS native code
├── android/              # Android native code
├── App.tsx               # Root component
├── index.js              # App entry point
└── package.json          # Dependencies
```

## 🎯 Current Status: Phase 1 - Foundation Complete

### ✅ Completed

- [x] React Native project initialization with TypeScript
- [x] Folder structure setup
- [x] TypeScript & ESLint configuration
- [x] Data models & interfaces (Trip, Step, Location, Photo, etc.)
- [x] Local storage utilities (AsyncStorage wrapper)
- [x] App-wide constants & helpers
- [x] Service class stubs:
  - `TrackerService` - Background location tracking (stub)
  - `CurationService` - Photo intelligence (stub)
  - `PermissionService` - Permission management (stub)
  - `TripService` - Trip management
- [x] React Navigation structure
- [x] Basic screen placeholders:
  - Onboarding flow
  - Home screen
  - Trip timeline screen

### 🚧 Next Steps (Phase 2 - Core R&D)

**Priority 1: TrackerService (CRITICAL)**
- Implement native iOS location tracking (CLLocationManager)
- Implement native Android location tracking (FusedLocationProviderClient)
- State-based GPS polling (stationary/walking/driving/flying)
- Battery optimization with geofencing
- Local SQLite database for raw location storage

**Priority 2: CurationService**
- Implement photo library access (iOS: PHPhotoLibrary, Android: MediaStore)
- Integrate on-device ML models (CoreML/TensorFlow Lite)
- Junk photo detection model
- Quality scoring model
- Photo clustering algorithm

**Priority 3: UI Development**
- Complete onboarding screens with permission requests
- Implement Mapbox integration for maps
- Build trip timeline UI with real-time updates
- Step editing interface
- Photo gallery component

## 🛠️ Tech Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Mobile Framework | React Native | Single codebase for iOS & Android |
| Language | TypeScript | Type safety & developer experience |
| Navigation | React Navigation | Industry standard, well-documented |
| Local Storage | AsyncStorage | Simple key-value storage for MVP |
| State Management | React Context/Hooks | Simple, built-in solution for MVP |
| Maps (Planned) | Mapbox | Superior visualization for travel paths |
| Backend (Planned) | Firebase | Auth, Firestore, Cloud Functions |
| Payments (Planned) | Stripe | Mobile-native checkout |
| POD (Planned) | Lulu/Peecho | Print-on-demand API |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository:**
   ```bash
   cd AI-Travel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install iOS dependencies:**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run on iOS:**
   ```bash
   npm run ios
   ```

5. **Run on Android:**
   ```bash
   npm run android
   ```

### Development

- **Start Metro bundler:**
  ```bash
  npm start
  ```

- **Run linter:**
  ```bash
  npm run lint
  ```

- **Run tests:**
  ```bash
  npm test
  ```

## 📱 Key Features (Planned)

### P0 - MVP Features

1. **Trust-First Onboarding**
   - Location permission (Always)
   - Photo library permission (Full access)
   - Clear privacy messaging

2. **Passive Tracking Engine**
   - Background location tracking
   - Smart battery optimization
   - Activity detection (walking/driving/flying)
   - Dwell time detection

3. **On-Device Photo Curation**
   - Automatic junk filtering
   - Quality scoring
   - Photo clustering by time/location
   - Privacy-first (no photo uploads)

4. **Trip Timeline**
   - Interactive map view
   - Chronological step timeline
   - Auto-generated steps
   - Manual editing capabilities

5. **Book Ordering** (Phase 6)
   - PDF generation
   - Interactive preview
   - Stripe checkout
   - POD integration

## 🔐 Privacy Commitment

**Atlas is 100% privacy-first:**

- All photo analysis happens **on-device**
- Photos are **never uploaded** to servers
- Location data is encrypted and used only for your journal
- No data selling, no advertising, no tracking for third parties
- Users own their data completely

## 📊 Success Metrics (KPIs)

### North Star Metric
- **Trip-to-Book Conversion Rate:** (Books Ordered) / (Trips Completed)

### P0 KPIs
1. **Onboarding Completion Rate:** % granting both permissions (Target: >60%)
2. **Manual Intervention Rate:** Manual steps / Total steps (Target: <10%)
3. **Battery Impact:** Daily drain % (Target: <5%)
4. **D30 Retention:** For users with active trips

## 🚨 Critical Risks

| Risk | Mitigation Strategy |
|------|---------------------|
| Battery drain | Extensive field testing, state-based polling, geofencing |
| Permission denial | A/B test onboarding copy, emphasize privacy |
| Inaccurate tracking | Sophisticated algorithms, manual override UI |
| Apple/Google competition | Focus on physical book USP, superior curation |

## 🤝 Contributing

This is a private project in active development. Contributions are currently limited to the core team.

## 📄 License

Proprietary - All rights reserved.

---

**Built with ❤️ by the Atlas team**

Last Updated: November 3, 2025
