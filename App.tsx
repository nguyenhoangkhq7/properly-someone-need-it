// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./app/context/AuthContext"; // <-- IMPORT 1
import AppNavigator from "./app/navigator/AppNavigator";
import AuthNavigator from "./app/navigator/AuthNavigator";
import { StatusBar } from "react-native";
import colors from "./app/config/color";

function RootNavigator() {
  const { userToken, isLoading } = useAuth(); // kiểm tra token + trạng thái boot

  // Giữ màn trắng khi đang hydrate token để tránh nháy màn
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer key={userToken ? "app" : "auth"}>
      {userToken ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// Component App chính
export default function App() {
  return (
    // BỌC TOÀN BỘ ỨNG DỤNG TRONG AUTH + USER PROVIDER
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <RootNavigator />
    </AuthProvider>
  );
}
