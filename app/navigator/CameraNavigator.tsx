import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostProductScreen from "../screens/PostProductScreen";
import PostProductDetailScreen from "../screens/PostProductDetailScreen";
import ShippingDetailScreen from "../screens/ShippingDetailScreen";
export type CameraStackParamList = {
    PostProduct: undefined;
    PostProductDetail:{product:any} | undefined;
    ShippingDetailScreen: undefined;
};

const Stack = createNativeStackNavigator<CameraStackParamList, "CameraStack">();

export default function CameraNavigator() {
    return (
        <Stack.Navigator id="CameraStack" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PostProduct" component={PostProductScreen} />
            <Stack.Screen name="PostProductDetail" component={PostProductDetailScreen} />
            <Stack.Screen name="ShippingDetailScreen" component={ShippingDetailScreen} />
        </Stack.Navigator>
    );
}