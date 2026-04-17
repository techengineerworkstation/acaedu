export default {
  expo: {
    name: 'Acaedu',
    slug: 'acadion',
    version: '1.0.0',
    orientation: 'portrait',
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
        NSLocationWhenInUseUsageDescription: 'Acaedu needs location access for campus navigation.',
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            'acadion.com': {
              NSIncludesSubdomains: true,
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionRequiresForwardSecrecy: true
            }
          }
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#3B82F6'
      },
      package: 'com.acadion.app',
      permissions: [
        'CAMERA',
        'RECORD_AUDIO',
        'READ_CONTACTS',
        'READ_CALENDAR',
        'WRITE_CALENDAR',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION'
      ]
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'static'
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#3B82F6',
          sounds: [],
          modes: ['default', 'critical']
        }
      ],
      [
        'expo-splash-screen',
        {
          'image': './assets/splash-icon.png',
          'resizeMode': 'contain',
          'backgroundColor': '#ffffff'
        }
      ]
    ],
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: 'acadion-mobile'
      },
      // API configuration
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://acaedu-web.vercel.app'
    }
  }
};
