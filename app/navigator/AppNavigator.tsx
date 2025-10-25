// AppNavigator.tsx (Tab Navigator)
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import CategoryScreen from "../screens/CategoryScreen";
import TrendingScreen from "../screens/TrendingScreen";
import AccountScreen from "../screens/AccountScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import SearchResultsScreen from "../screens/SearchResultScreen"; // ✅ THÊM MỚI

// -------------------------
// ✅ Loại chính cho Tab Navigation
// -------------------------
export type RootTabParamList = {
  HomeStack: undefined;
  Category: undefined;
  Trending: undefined;
  Chat: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const ChatStack = createStackNavigator();
const HomeStack = createStackNavigator();


function ChatStackNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </ChatStack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}



export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tab.Screen name="HomeStack" component={HomeStackNavigator} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Chat" component={ChatStackNavigator} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
