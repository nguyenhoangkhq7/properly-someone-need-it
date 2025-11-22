import Constants from "expo-constants";

interface ExpoExtra {
  apiUrl?: string;
}

export const getApiBaseUrl = (): string => {
  const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
  const apiUrl = extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "Missing API base URL. Set EXPO_PUBLIC_API_URL in your .env or app config."
    );
  }

  return apiUrl;
};

export const getSocketBaseUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  if (apiUrl.endsWith("/api")) {
    return apiUrl.slice(0, -4);
  }
  if (apiUrl.endsWith("/api/")) {
    return apiUrl.slice(0, -5);
  }
  return apiUrl;
};
