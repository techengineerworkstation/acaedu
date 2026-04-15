# Acadion Mobile App

React Native mobile application for Acadion Smart Academic Scheduling System.

## Tech Stack

- React Native with Expo
- Expo Router for navigation
- Firebase Auth
- Supabase for data
- React Query for server state
- Zustand for client state
- React Hook Form + Zod for forms

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## Configuration

1. Copy `.env.example` to `.env` and fill in the same credentials as web app
2. Configure Firebase for iOS/Android in Firebase Console
3. Add reverse client IDs for deep linking

## Building for App Stores

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android --channel amazon
```

## Key Features

- Authentication (Google, Apple, Email)
- Student dashboard with schedule
- Lecturer course management
- Announcements
- Push notifications via FCM
- Deep linking from notifications
- Offline data caching (AsyncStorage)

## Project Structure

```
src/
├── app/                  # Expo Router screens
│   ├── (auth)/          # Auth screens
│   ├── (tabs)/          # Tab navigator screens
│   ├── (student)/       # Student screens
│   ├── (lecturer)/      # Lecturer screens
│   ├── (admin)/         # Admin screens
│   └── _layout.tsx      # Root layout
├── components/          # Reusable UI components
├── screens/             # Standalone screens (legacy)
├── services/            # API, Firebase, storage services
├── navigation/          # Navigation configuration
├── stores/              # Zustand stores
├── utils/               # Utility functions
└── constants/           # App constants
```

## Architecture Notes

- Uses Expo Router for file-based routing
- All screens are server components by default
- State management: React Query + Zustand
- Forms: React Hook Form with Zod validation
- UI: Custom components + React Native Paper (optional)

## Push Notifications

Configure Firebase Cloud Messaging:

1. Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
2. Configure Expo notifications plugin
3. Request permissions on app start
4. Register device token with backend

## Deep Linking

Notifications open specific screens using deep links.

Config:
```json
{
  "scheme": "acadion",
  "host": "acadion.com"
}
```

Link format:
```
acadion://notification?id=123
acadion://course?id=456
```

## Testing

```bash
# Run tests
npm test

# Lint
npm run lint

# Type-check
npm run type-check
```

## Deployment

1. Build with EAS
2. Submit to App Store Connect and Google Play Console
3. Configure App Store listing with screenshots, descriptions
4. For Amazon App Store: submit APK to Amazon Developer Console

## Troubleshooting

- iOS build failures: check Xcode version, certificates
- Android build failures: check keystore, Google Play Console setup
- Push notifications: verify FCM configuration, APNs certificates

See Expo documentation for detailed platform-specific setup.
