// context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import  colors  from '../config/color'; // Đường dẫn tới file màu của bạn
import { View, ActivityIndicator } from 'react-native';

interface AuthContextType {
  userToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu ở trạng thái loading

  useEffect(() => {
    // Hàm này sẽ kiểm tra xem token đã được lưu từ lần trước chưa
    const bootstrapAsync = async () => {
      let token = null;
      try {
        // token = await AsyncStorage.getItem('userToken'); // Bỏ comment khi bạn sẵn sàng lưu
      } catch (e) {
        console.error("Failed to fetch token", e);
      }
      
      setUserToken(token); 
      setIsLoading(false); // Hết loading
    };

    bootstrapAsync();
  }, []);

  const login = async (token: string) => {
    try {
      // await AsyncStorage.setItem('userToken', token); // Bỏ comment khi dùng
      setUserToken(token);
    } catch (e) {
      console.error("Failed to save token", e);
    }
  };

  const logout = async () => {
    try {
      // await AsyncStorage.removeItem('userToken'); // Bỏ comment khi dùng
      setUserToken(null);
    } catch (e) {
      console.error("Failed to remove token", e);
    }
  };

  // Hiển thị màn hình loading trong khi đang check token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Khi hết loading, cung cấp context cho các component con
  return (
    <AuthContext.Provider value={{ userToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Đây chính là hook "useAuth" mà bạn cần!
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};