import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CategoryScreen from "../screens/CategoryScreen";
import AccountNavigator from "./AccountNavigator";
import BottomNav from "./BottomNav";
import HomeNavigator from "./HomeNavigator";
import ChatNavigator from "./ChatNavigator";
import CameraNavigator from "./CameraNavigator";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />} // custom navbar
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeStack" component={HomeNavigator} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="Account" component={AccountNavigator} />
      <Tab.Screen name="Center" component={CameraNavigator}  options={{tabBarStyle: { display: "none" }}}/>
    </Tab.Navigator>
  );
}
