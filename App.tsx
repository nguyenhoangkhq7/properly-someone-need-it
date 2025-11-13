
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './app/context/AuthContext'; // <-- IMPORT 1
import AppNavigator from './app/navigator/AppNavigator';
import AuthNavigator from './app/navigator/AuthNavigator';
import { StatusBar } from 'react-native';
import  colors  from './app/config/color';

// Component con để quyết định hiển thị Navigator nào
// Nó phải được đặt BÊN TRONG AuthProvider để có thể dùng useAuth()
function RootNavigator() {
  const { userToken } = useAuth(); // <-- Bây giờ hook này sẽ hoạt động

  return (
    <NavigationContainer>
      {userToken ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// Component App chính
export default function App() {
  return (
    // BỌC TOÀN BỘ ỨNG DỤNG TRONG AUTHPROVIDER
    <AuthProvider> 
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <RootNavigator /> 
    </AuthProvider>
  );
}

