import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AccountScreen from "../screens/AccountScreen";
import SellerOrdersScreen from "../screens/SellerOrdersScreen";
import BuyerOrdersScreen from "../screens/BuyerOrdersScreen";
import MySellingItemDetailScreen from "../screens/MySellingItemDetailScreen";
import MySellingItemsScreen from "../screens/MySellingItemsScreen";
import ProfileEditScreen from "../screens/ProfileEditScreen";
import colors from "../config/color";
import ShopScreen from "../screens/ShopScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
export type AccountStackParamList = {
  AccountMain: undefined;
  SellerOrders: undefined;
  BuyerOrders: undefined;
  MySellingItemDetail: { itemId: string };
  MySellingItems: undefined;
  ProfileEdit: undefined;
  ShopScreen: { shop: any };
  ProductDetail: { product: any };
};

const Stack = createStackNavigator<AccountStackParamList, "AccountStack">();

export default function AccountNavigator() {
  return (
    <Stack.Navigator id="AccountStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountMain" component={AccountScreen} />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} />
      <Stack.Screen name="BuyerOrders" component={BuyerOrdersScreen} />
      <Stack.Screen
        name="MySellingItemDetail"
        component={MySellingItemDetailScreen}
      />
      <Stack.Screen name="MySellingItems" component={MySellingItemsScreen} />
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{
          headerShown: true,
          title: "Thông tin cá nhân",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
        }}
      />
    </Stack.Navigator>
  );
}
