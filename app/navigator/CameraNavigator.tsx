import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostProductScreen from "../screens/PostProductScreen";
import PostProductDetailScreen from "../screens/PostProductDetailScreen";
import ShippingDetailScreen from "../screens/ShippingDetailScreen";
import MapPickerScreen from "../screens/MapPickerScreen";
export type CameraStackParamList = {
    PostProduct: { product?: any } | undefined;
    PostProductDetail: { product: any } | undefined;
    ShippingDetailScreen: { product: any; pickupAddress?: string; latitude?: number; longitude?: number } | undefined;
    MapPickerScreen: { product: any; latitude?: number; longitude?: number } | undefined;
};

const Stack = createNativeStackNavigator<CameraStackParamList, "CameraStack">();

export default function CameraNavigator() {
    return (
        <Stack.Navigator id="CameraStack" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PostProduct" component={PostProductScreen} />
            <Stack.Screen name="PostProductDetail" component={PostProductDetailScreen} />
            <Stack.Screen name="ShippingDetailScreen" component={ShippingDetailScreen} />
            <Stack.Screen name="MapPickerScreen" component={MapPickerScreen} />
        </Stack.Navigator>
    );
}