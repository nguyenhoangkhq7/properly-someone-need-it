// AppNavigator.tsx (Tab Navigator)
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import CategoryScreen from "../screens/CategoryScreen";
import TrendingScreen from "../screens/TrendingScreen";
import ChatScreen from "../screens/ChatScreen";
import AccountScreen from "../screens/AccountScreen";
import BottomNav from "./BottomNav";

export type RootTabParamList = {
  Home: undefined;
  Category: undefined;
  Trending: undefined;
  Chat: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
  screenOptions={{ headerShown: false }}
  tabBar={(props) => <BottomNav {...props} />} // ✅ custom tab bar
>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
