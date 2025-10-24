import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./app/navigator/AppNavigator";
import BottomNav from "./app/navigator/BottomNav";
import RootStack from "./app/navigator/RootStack";

export default function App() {
  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <RootStack />
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
