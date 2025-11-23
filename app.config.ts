import type { ConfigContext, ExpoConfig } from "expo/config";

const baseConfig: ExpoConfig = {
  name: "properly-someone-need-it",
  slug: "properly-someone-need-it",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router"],
};

export default (_ctx: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

  return {
    ...baseConfig,
    extra: {
      ...(baseConfig.extra ?? {}),
      apiUrl,
      cloudinary: {
        cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        folder: process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER,
      },
    },
  };
};
