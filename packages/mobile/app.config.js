export default {
  expo: {
    name: 'Acaedu',
    slug: 'acadion',
    version: '1.0.0',
    orientation: 'default',
    icon: './assets/icon.png',
    scheme: 'acadion',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.acadion.app',
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        UIBackgroundModes: ['remote-notification', 'audio'],
        NSCameraUsageDescription: 'Used for uploading profile photos',
        NSPhotoLibraryUsageDescription: 'Used for uploading profile photos and materials'
      },
      associatedDomains: ['applinks:acadion.com', 'applinks:*.acadion.com'],
      googleServicesFile: './GoogleService-Info.plist'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#3B82F6'
      },
      package: 'com.acadion.app',
      googleServicesFile: './google-services.json',
      permissions: ['RECEIVE_BOOT_COMPLETED', 'VIBRATE', 'CAMERA', 'READ_EXTERNAL_STORAGE'],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            { scheme: 'https', host: 'acadion.com', pathPrefix: '/' },
            { scheme: 'acadion' }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        }
      ]
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro'
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#3B82F6',
          sounds: ['./assets/sounds/alarm.wav'],
          mode: 'production'
        }
      ],
      [
        'expo-build-properties',
        {
          android: { compileSdkVersion: 34, targetSdkVersion: 34, minSdkVersion: 24 },
          ios: { deploymentTarget: '15.0' }
        }
      ]
    ],
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: 'your-eas-project-id'
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
    },
    updates: {
      url: 'https://u.expo.dev/your-eas-project-id'
    },
    runtimeVersion: {
      policy: 'appVersion'
    }
  }
};
