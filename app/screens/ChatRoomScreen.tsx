import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import colors from "../config/color";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
}

const finalColors = {
  ...colors,
  text: colors.text || "#FFFFFF",
  textSecondary: colors.textSecondary || "#BDBDBD",
  background: colors.background || "#0A0A0A",
  surface: colors.surface || "#1F1F1F",
  primary: colors.primary || "#007AFF",
  muted: colors.muted || "#555555",
  border: colors.border || "#232621",
};

export default function ChatRoomScreen({ route, navigation }: any) {
  const { chat = {}, prefillMessage } = route.params || {};
  const chatInfo = {
    name: chat.name || "Người bán",
    avatar: chat.avatar || "https://picsum.photos/200",
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Xin chào!", sender: "other", time: "09:00" },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList<Message>>(null);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (prefillMessage) {
      const ts = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: prefillMessage, sender: "me", time: ts },
      ]);
    }
  }, [prefillMessage]);

  const sendMessage = () => {
    if (inputText.trim() === "") return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  const handleCall = (type: "audio" | "video") => {
    alert(`Đang gọi ${type === "video" ? "video" : "thoại"} tới ${chatInfo.name}...`);
  };

  const handleAttachFile = () => {
    alert("Mở chọn File/Ảnh...");
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "me" ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={[styles.messageText, item.sender === "me" && styles.myMessageText]}>
        {item.text}
      </Text>
      <Text style={[styles.timeText, item.sender === "me" && styles.myTimeText]}>
        {item.time}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 30 }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
          <Ionicons name="arrow-back" size={24} color={finalColors.text} />
        </TouchableOpacity>

        <Image source={{ uri: chatInfo.avatar }} style={styles.avatar} />

        <Text style={styles.headerTitle} numberOfLines={1}>
          {chatInfo.name}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => handleCall("video")} style={styles.actionButton}>
            <Feather name="video" size={20} color={finalColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCall("audio")} style={styles.actionButton}>
            <Feather name="phone" size={20} color={finalColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ backgroundColor: finalColors.surface }}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleAttachFile} style={styles.attachButton}>
            <Feather name="plus-circle" size={24} color={finalColors.muted} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={finalColors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
            onSubmitEditing={sendMessage}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              inputText.trim() === "" && { opacity: 0.5 },
            ]}
            disabled={inputText.trim() === ""}
          >
            <Ionicons name="send" size={22} color={finalColors.text} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: finalColors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: finalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: finalColors.border,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 5, marginRight: 10 },
  headerTitle: {
    flex: 1,
    color: finalColors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  actionButton: {
    paddingHorizontal: 8,
  },
  messageList: { padding: 10 },
  messageContainer: {
    maxWidth: "75%",
    marginVertical: 4,
    padding: 10,
    borderRadius: 16,
    minWidth: 80,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: finalColors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: finalColors.surface,
    borderWidth: 1,
    borderColor: finalColors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: { color: finalColors.text, fontSize: 15 },
  myMessageText: { color: finalColors.surface },
  timeText: {
    fontSize: 10,
    color: finalColors.textSecondary,
    textAlign: "right",
    marginTop: 3,
  },
  myTimeText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: finalColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: finalColors.border,
  },
  attachButton: {
    paddingRight: 10,
    paddingLeft: 5,
  },
  input: {
    flex: 1,
    color: finalColors.text,
    backgroundColor: finalColors.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: finalColors.primary,
    borderRadius: 20,
    padding: 9,
    marginLeft: 4,
  },
});
