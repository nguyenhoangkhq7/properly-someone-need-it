import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AccountScreen from "../screens/AccountScreen";
import SellerOrdersScreen from "../screens/SellerOrdersScreen";
import BuyerOrdersScreen from "../screens/BuyerOrdersScreen";
import MySellingItemsScreen from "../screens/MySellingItemsScreen";

export type AccountStackParamList = {
  AccountMain: undefined;
  SellerOrders: undefined;
  BuyerOrders: undefined;
  MySellingItems: undefined;
};

const Stack = createStackNavigator<AccountStackParamList>();

export default function AccountNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountMain" component={AccountScreen} />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} />
      <Stack.Screen name="BuyerOrders" component={BuyerOrdersScreen} />
      <Stack.Screen name="MySellingItems" component={MySellingItemsScreen} />
    </Stack.Navigator>
  );
}
