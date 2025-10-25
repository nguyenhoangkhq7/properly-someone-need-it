import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigator from "./AppNavigator"; // Tab Navigator
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ShopScreen from "../screens/ShopScreen";
import { Product } from "../data/products";
import { Shop } from "../data/shops";
// import {}

export type RootStackParamList = {
  Main: undefined; // Tab navigator
  ProductDetail: { product: Product };
  ShopScreen: { shop:Shop };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={AppNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
    </Stack.Navigator>
  );
}
