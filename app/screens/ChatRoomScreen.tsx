import React, { useState, useRef, useEffect } from "react";
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
import { Ionicons, Feather } from "@expo/vector-icons"; // Thêm Feather cho icon gọi/gửi file
import colors from "../config/color";

interface Message {
    id: string;
    text: string;
    sender: "me" | "other";
    time: string;
}

// Giả định màu sắc
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
  const { chat } = route.params;
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Xin chào 👋!", sender: "other", time: "09:00" },
    { id: "2", text: "Mình muốn hỏi về sản phẩm mới.", sender: "me", time: "09:01" },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList<Message>>(null);

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

  const handleCall = (type: 'audio' | 'video') => {
      alert(`Đang gọi ${type === 'video' ? 'video' : 'thoại'} tới ${chat.name}...`);
  };

  const handleAttachFile = () => {
      alert("Mở hộp thoại chọn File/Ảnh...");
  };

  useEffect(() => {
    // Cuộn xuống cuối sau khi tin nhắn được cập nhật
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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
      <View style={{height:30}}/>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
          <Ionicons name="arrow-back" size={24} color={finalColors.text} />
        </TouchableOpacity>
        
        <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        
        <Text style={styles.headerTitle} numberOfLines={1}>{chat.name}</Text>
        
        <View style={styles.headerActions}>
            {/* Nút Gọi Video */}
            <TouchableOpacity onPress={() => handleCall('video')} style={styles.actionButton}>
                <Feather name="video" size={20} color={finalColors.primary} />
            </TouchableOpacity>
            {/* Nút Gọi Audio */}
            <TouchableOpacity onPress={() => handleCall('audio')} style={styles.actionButton}>
                <Feather name="phone" size={20} color={finalColors.primary} />
            </TouchableOpacity>
        </View>
      </View>

      {/* DANH SÁCH TIN NHẮN */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        inverted={false} // Hiển thị tin nhắn từ trên xuống
      />

      {/* Ô NHẬP TIN NHẮN */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ backgroundColor: finalColors.surface }}
      >
        <View style={styles.inputContainer}>
            {/* Nút Gửi File/Ảnh */}
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
                    // Giảm độ mờ nếu có nội dung
                    inputText.trim() === "" && { opacity: 0.5 } 
                ]}
                disabled={inputText.trim() === ""}
            >
                {/* Thay màu icon send thành màu sáng để tương phản */}
                <Ionicons name="send" size={22} color={finalColors.text} /> 
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: finalColors.background },
    
    // --- HEADER ---
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
        flex: 1, // Đảm bảo title không bị đẩy lùi bởi các action
        color: finalColors.text, 
        fontSize: 18, 
        fontWeight: "700",
    },
    headerActions: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    actionButton: {
        paddingHorizontal: 8,
    },

    // --- MESSAGE LIST ---
    messageList: { padding: 10 },
    messageContainer: {
        maxWidth: "75%",
        marginVertical: 4, // Giảm margin dọc
        padding: 10,
        borderRadius: 16, // Bo tròn nhiều hơn
        minWidth: 80,
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: finalColors.primary,
        borderBottomRightRadius: 4, // Đuôi tin nhắn sát góc
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: finalColors.surface,
        borderWidth: 1,
        borderColor: finalColors.border,
        borderBottomLeftRadius: 4, // Đuôi tin nhắn sát góc
    },
    messageText: { color: finalColors.text, fontSize: 15 },
    myMessageText: { color: finalColors.surface }, // Đổi màu chữ cho tin nhắn của tôi
    timeText: {
        fontSize: 10, // Giảm cỡ chữ thời gian
        color: finalColors.textSecondary,
        textAlign: "right",
        marginTop: 3,
    },
    myTimeText: {
        color: 'rgba(255, 255, 255, 0.7)', // Màu thời gian sáng hơn trên nền primary
    },

    // --- INPUT BAR ---
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: finalColors.surface,
        paddingHorizontal: 10,
        paddingVertical: 8, // Giảm padding dọc
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
        backgroundColor: finalColors.background, // Dùng màu background cho nền input
        borderRadius: 20, // Bo tròn hơn
        paddingHorizontal: 15,
        paddingVertical: 10, // Tăng padding dọc cho input
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