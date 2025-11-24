// context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { View, ActivityIndicator } from "react-native";
import colors from "../config/color";
import axios from "axios";
import { authTokenManager, type ApiClientError, type ApiResponse } from "../api/axiosClient";
import { fetchCurrentUser, type AccountProfile } from "../api/authApi";
import { getApiBaseUrl } from "../config/api";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role?: "user" | "admin";
}

export type AuthUser = AccountProfile;

interface AuthContextType {
  accessToken: string | null;
  userToken: string | null;
  user: AuthUser | null;
  role: "user" | "admin" | null;
  isLoading: boolean;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleProfileError = useCallback(async (error: unknown) => {
    console.error("Failed to fetch current user", error);
    const maybeApiError = error as ApiClientError | undefined;
    if (maybeApiError?.status === 401) {
      await authTokenManager.clearTokens();
      if (isMountedRef.current) {
        setAccessToken(null);
        setUser(null);
      }
    }
  }, []);

  const fetchAndStoreProfile = useCallback(async () => {
    try {
      const profile = await fetchCurrentUser();
      if (isMountedRef.current) {
        setUser(profile);
      }
      return profile;
    } catch (error) {
      await handleProfileError(error);
      throw error;
    }
  }, [handleProfileError]);

  const loadProfile = useCallback(async () => {
    if (isMountedRef.current) {
      setIsProfileLoading(true);
    }
    try {
      return await fetchAndStoreProfile();
    } finally {
      if (isMountedRef.current) {
        setIsProfileLoading(false);
      }
    }
  }, [fetchAndStoreProfile]);

  const refreshProfile = useCallback(async () => {
    return fetchAndStoreProfile();
  }, [fetchAndStoreProfile]);

  const refreshAccessToken = useCallback(
    async (refreshToken: string | null) => {
      if (!refreshToken) {
        return null;
      }
      try {
        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${getApiBaseUrl()}/auth/refresh-token`,
          { refreshToken }
        );
        const newAccessToken = response.data.data.accessToken;
        await authTokenManager.setTokens({ accessToken: newAccessToken });
        if (isMountedRef.current) {
          setAccessToken(newAccessToken);
        }
        return newAccessToken;
      } catch {
        await authTokenManager.clearTokens();
        if (isMountedRef.current) {
          setAccessToken(null);
          setUser(null);
        }
        return null;
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const tokens = await authTokenManager.hydrate();
        if (!isMounted) return;

        const hasRefreshToken = !!tokens.refreshToken;
        setAccessToken(tokens.accessToken);

        // Only attempt auto-restore when we have a refresh token.
        if (hasRefreshToken) {
          const refreshedAccessToken = await refreshAccessToken(tokens.refreshToken);
          if (refreshedAccessToken) {
            try {
              await loadProfile();
            } catch (error) {
              console.warn("Failed to load profile after refresh", error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to hydrate tokens", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadProfile, refreshAccessToken]);

  const login = async (tokens: AuthTokens) => {
    await authTokenManager.setTokens(tokens);
    setAccessToken(tokens.accessToken);
    try {
      await loadProfile();
    } catch (error) {
      await authTokenManager.clearTokens();
      if (isMountedRef.current) {
        setAccessToken(null);
        setUser(null);
      }
      throw error;
    }
  };

  const logout = async () => {
    await authTokenManager.clearTokens();
    setAccessToken(null);
    setUser(null);
  };

  const isBootstrapping = isLoading || isProfileLoading;

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const role = user?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        userToken: accessToken,
        user,
        role,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
