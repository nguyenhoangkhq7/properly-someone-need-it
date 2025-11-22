// File: navigator/ChatNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatListScreen from "../screens/ChatListScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import type { ChatRoomSummary } from "../api/chatApi";

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { room: ChatRoomSummary; prefillMessage?: string };
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
