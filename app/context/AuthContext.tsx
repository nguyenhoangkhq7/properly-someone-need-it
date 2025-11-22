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
import { authTokenManager, type ApiClientError } from "../api/axiosClient";
import { fetchCurrentUser, type AccountProfile } from "../api/authApi";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const loadProfile = useCallback(async () => {
    try {
      const profile = await fetchCurrentUser();
      if (isMountedRef.current) {
        setUser(profile);
      }
    } catch (error) {
      await handleProfileError(error);
    }
  }, [handleProfileError]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const tokens = await authTokenManager.hydrate();
        if (isMounted) {
          setAccessToken(tokens.accessToken);
          if (tokens.accessToken) {
            await loadProfile();
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
  }, [loadProfile]);

  const login = async (tokens: AuthTokens) => {
    await authTokenManager.setTokens(tokens);
    setAccessToken(tokens.accessToken);
    await loadProfile();
  };

  const logout = async () => {
    await authTokenManager.clearTokens();
    setAccessToken(null);
    setUser(null);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const role = user?.role ?? null;

  return (
    <AuthContext.Provider
      value={{ accessToken, userToken: accessToken, user, role, isLoading, login, logout }}
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