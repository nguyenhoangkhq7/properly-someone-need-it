import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CategoryScreen from "../screens/CategoryScreen";
import ChatScreen from "../screens/ChatListScreen";
import AccountScreen from "../screens/AccountScreen";
import BottomNav from "./BottomNav";
import HomeNavigator from "./HomeNavigator";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />} // custom navbar
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeStack" component={HomeNavigator} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
