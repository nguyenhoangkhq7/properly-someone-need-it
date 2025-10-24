import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import AppNavigator from "./app/navigator/AppNavigator";
import BottomNav from "./app/navigator/BottomNav";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>("Home");

  // Các màn hình cần ẩn thanh BottomNav
  const hideBottomNavScreens = ["ChatRoom", "SearchResults"];

  return (
    <NavigationContainer
      onStateChange={(state) => {
        if (!state) return;
        const route = state.routes[state.index];
        const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;
        setCurrentRoute(focusedRouteName);
      }}
    >
      <View style={styles.container}>
        <AppNavigator />
        {!hideBottomNavScreens.includes(currentRoute) && <BottomNav />}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // nền đen đồng bộ giao diện
  },
});
