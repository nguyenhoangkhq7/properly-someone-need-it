// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./app/context/AuthContext"; // <-- IMPORT 1
import { UserProvider } from "./app/context/UserContext";
import AppNavigator from "./app/navigator/AppNavigator";
import AuthNavigator from "./app/navigator/AuthNavigator";
import { StatusBar } from "react-native";
import colors from "./app/config/color";

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
    // BỌC TOÀN BỘ ỨNG DỤNG TRONG AUTH + USER PROVIDER
    <AuthProvider>
      <UserProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <RootNavigator />
      </UserProvider>
    </AuthProvider>
  );
}
