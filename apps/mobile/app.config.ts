import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): any => ({
  ...config,
  name: 'CampusOS',
  slug: 'campusos-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.campusos.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.campusos.app',
    permissions: [
      'android.permission.CAMERA'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://campusos-api-3r6a.onrender.com'
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission: 'Allow CampusOS to access your camera to scan attendance QR codes.'
      }
    ]
  ]
});
