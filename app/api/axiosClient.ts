import axios,
  {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosRequestHeaders,
    AxiosResponse,
  } from "axios";
import { tokenStorage, type StoredTokens } from "../utils/storage";
import { getApiBaseUrl } from "../config/api";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
}

interface ApiErrorPayload {
  success: false;
  message: string;
  errorCode?: string;
}

export interface ApiClientError {
  message: string;
  errorCode?: string;
  status?: number;
}

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponsePayload {
  accessToken: string;
  refreshToken?: string | null;
}

const API_BASE_URL = getApiBaseUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let inMemoryTokens: StoredTokens = { accessToken: null, refreshToken: null };
let hasHydratedTokens = false;
let refreshPromise: Promise<string | null> | null = null;

const ensureTokensHydrated = async () => {
  if (!hasHydratedTokens) {
    inMemoryTokens = await tokenStorage.getTokens();
    hasHydratedTokens = true;
  }
};

const updateInMemoryTokens = (tokens: Partial<StoredTokens>) => {
  inMemoryTokens = { ...inMemoryTokens, ...tokens };
};

const persistTokens = async (tokens: Partial<StoredTokens>) => {
  updateInMemoryTokens(tokens);
  hasHydratedTokens = true;
  await tokenStorage.saveTokens(tokens);
};

const clearPersistedTokens = async () => {
  updateInMemoryTokens({ accessToken: null, refreshToken: null });
  hasHydratedTokens = true;
  await tokenStorage.clearTokens();
};

const extractError = (error: AxiosError<ApiErrorPayload>): ApiClientError => {
  const message = error.response?.data?.message ?? error.message;
  const errorCode = error.response?.data?.errorCode;
  const status = error.response?.status;
  return { message, errorCode, status };
};

const performRefresh = async (): Promise<string | null> => {
  await ensureTokensHydrated();
  const refreshToken = inMemoryTokens.refreshToken;
  if (!refreshToken) {
    return null;
  }

  const response: AxiosResponse<ApiResponse<RefreshResponsePayload>> =
    await refreshClient.post("/auth/refresh-token", {
      refreshToken,
    });

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    response.data.data;
  await persistTokens({
    accessToken: newAccessToken,
    refreshToken:
      typeof newRefreshToken === "string" ? newRefreshToken : refreshToken,
  });
  return newAccessToken;
};

const queueRefresh = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await performRefresh();
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

const ensureHeaders = (config: AxiosRequestConfig): AxiosRequestHeaders => {
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }
  return config.headers as AxiosRequestHeaders;
};

api.interceptors.request.use(async (config) => {
  await ensureTokensHydrated();
  if (inMemoryTokens.accessToken) {
    const headers = ensureHeaders(config);
    headers.Authorization = `Bearer ${inMemoryTokens.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetryableRequestConfig;
    const status = error.response?.status;

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await queueRefresh();
        if (newAccessToken) {
          const headers = ensureHeaders(originalRequest);
          headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await clearPersistedTokens();
        if (axios.isAxiosError(refreshError)) {
          return Promise.reject(extractError(refreshError));
        }
        return Promise.reject({
          message: (refreshError as Error)?.message ?? "Refresh token failed",
        });
      }
      await clearPersistedTokens();
    }

    return Promise.reject(extractError(error));
  }
);

export const authTokenManager = {
  async hydrate() {
    await ensureTokensHydrated();
    return inMemoryTokens;
  },
  async setTokens(tokens: Partial<StoredTokens>) {
    await persistTokens(tokens);
  },
  async clearTokens() {
    await clearPersistedTokens();
  },
  getAccessToken() {
    return inMemoryTokens.accessToken;
  },
  getRefreshToken() {
    return inMemoryTokens.refreshToken;
  },
};

export default api;
