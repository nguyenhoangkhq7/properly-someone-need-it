import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "psni.accessToken";
const REFRESH_TOKEN_KEY = "psni.refreshToken";

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

const saveItem = async (key: string, value: string | null) => {
  if (value) {
    await SecureStore.setItemAsync(key, value);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const tokenStorage = {
  async saveTokens(tokens: {
    accessToken?: string | null;
    refreshToken?: string | null;
  }) {
    if (tokens.accessToken !== undefined) {
      await saveItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    }
    if (tokens.refreshToken !== undefined) {
      await saveItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  },

  async getTokens(): Promise<StoredTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    return { accessToken, refreshToken };
  },

  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
