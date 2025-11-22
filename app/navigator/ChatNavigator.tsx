// File: navigator/ChatNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatListScreen from "../screens/ChatListScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { roomId: string; recipient?: any }; // có thể truyền id phòng và người nhận
};

const Stack = createNativeStackNavigator<ChatStackParamList, "ChatStack">();

export default function ChatNavigator() {
  return (
    <Stack.Navigator id="ChatStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}
