// File: navigator/HomeNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import ShopScreen from "../screens/ShopScreen";
import SearchResultsScreen from "../screens/SearchResultScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import AllRatingScreen from "../screens/AllRatingScreen";

export type HomeStackParamList = {
  HomeScreen: undefined;
  ShopScreen: { shop: any };
  SearchResults: { query?: string; category?: string };
  ProductDetail: { product: any }; // ✅ thêm dòng này
  AllRatingScreen: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="AllRatingScreen" component={AllRatingScreen} />
    </Stack.Navigator>
  );
}
