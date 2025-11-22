import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import colors from "../config/color";
import { useNavigation } from "@react-navigation/native";
import { chatApi, type ChatMessage, type ChatRoomSummary } from "../api/chatApi";
import { getChatSocket } from "../utils/chatSocket";
import { useAuth } from "../context/AuthContext";

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

const TYPING_DEBOUNCE_MS = 500;
const FALLBACK_AVATAR = "https://placehold.co/100x100/1F1F1F/F6FF00?text=U";

export default function ChatRoomScreen({ route, navigation }: any) {
  const { room }: { room: ChatRoomSummary } = route.params;
  const roomId = room?.roomId;
  const { accessToken, user } = useAuth();
  const chatSocket = useMemo(() => getChatSocket(accessToken ?? null), [accessToken]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  if (!room || !roomId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.messageLoading}>
          <Text style={styles.emptyFallback}>Không tìm thấy phòng chat.</Text>
        </View>
      </SafeAreaView>
    );
  }

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const exists = prev.some((item) => item.id === message.id);
      if (exists) {
        return prev.map((item) => (item.id === message.id ? message : item));
      }
      return [...prev, message];
    });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    setIsLoadingMessages(true);
    try {
      const data = await chatApi.getMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [roomId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    setIsPeerTyping(false);
  }, [roomId]);

  const markAsRead = useCallback(async () => {
    if (!roomId) return;
    try {
      await chatApi.markAsRead(roomId);
      chatSocket?.emit("message:read", { roomId });
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  }, [chatSocket, roomId]);

  useEffect(() => {
    void markAsRead();
  }, [markAsRead]);

    const handleCall = (type: 'audio' | 'video') => {
      alert(`Đang gọi ${type === 'video' ? 'video' : 'thoại'} tới ${room?.peer?.name ?? 'người dùng'}...`);
    };

  const handleAttachFile = () => {
    alert("Mở chọn File/Ảnh...");
  };

  const handleSocketEvents = useCallback(() => {
    if (!chatSocket || !roomId) return () => {};

    chatSocket.emit("room:join", { roomId });

    const handleNewMessage = (message: ChatMessage) => {
      if (message.roomId !== roomId) return;
      appendMessage(message);
      if (message.senderId !== user?.id) {
        void markAsRead();
      }
    };

    const handleTypingUpdate = (payload: {
      roomId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (payload.roomId !== roomId) return;
      if (payload.userId === room?.peer?.id) {
        setIsPeerTyping(payload.isTyping);
      }
    };

    chatSocket.on("message:new", handleNewMessage);
    chatSocket.on("typing:update", handleTypingUpdate);

    return () => {
      chatSocket.off("message:new", handleNewMessage);
      chatSocket.off("typing:update", handleTypingUpdate);
    };
  }, [appendMessage, chatSocket, markAsRead, room?.peer?.id, roomId, user?.id]);

  useEffect(() => {
    const cleanup = handleSocketEvents();
    return cleanup;
  }, [handleSocketEvents]);

  const sendMessage = useCallback(() => {
    if (!roomId) return;
    const content = inputText.trim();
    if (!content) return;
    setInputText("");

    const onError = (message?: string) => {
      Alert.alert("Không gửi được", message ?? "Vui lòng thử lại.");
      setInputText(content);
    };

    if (chatSocket) {
      chatSocket.emit(
        "message:send",
        { roomId, content },
        (response?: { success: boolean; data?: ChatMessage; error?: string }) => {
          if (!response?.success) {
            onError(response?.error);
            return;
          }
          if (!response?.data) {
            return;
          }
          appendMessage(response.data);
        }
      );
      return;
    }

    chatApi
      .sendMessage(roomId, content)
      .then((message) => appendMessage(message))
      .catch((error) => {
        console.error("Failed to send message", error);
        onError();
      });
  }, [appendMessage, chatSocket, inputText, roomId]);

  const emitTypingState = useCallback(
    (isTyping: boolean) => {
      if (!roomId || !chatSocket) return;
      chatSocket.emit("typing:update", { roomId, isTyping });
    },
    [chatSocket, roomId]
  );

  const handleTypingChange = useCallback(
    (text: string) => {
      setInputText(text);
      if (!roomId) return;

      const trimmed = text.trim();
      if (trimmed.length > 0 && !isTypingRef.current) {
        isTypingRef.current = true;
        emitTypingState(true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          emitTypingState(false);
          isTypingRef.current = false;
        }
      }, TYPING_DEBOUNCE_MS);
    },
    [emitTypingState, roomId]
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        emitTypingState(false);
        isTypingRef.current = false;
      }
    };
  }, [emitTypingState]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 30 }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
          <Ionicons name="arrow-back" size={24} color={finalColors.text} />
        </TouchableOpacity>
        
        <Image source={{ uri: room?.peer?.avatar ?? FALLBACK_AVATAR }} style={styles.avatar} />
        
        <Text style={styles.headerTitle} numberOfLines={1}>{room?.peer?.name}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => handleCall("video")} style={styles.actionButton}>
            <Feather name="video" size={20} color={finalColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCall("audio")} style={styles.actionButton}>
            <Feather name="phone" size={20} color={finalColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* DANH SÁCH TIN NHẮN */}
      {isLoadingMessages ? (
        <View style={styles.messageLoading}>
          <ActivityIndicator color={finalColors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }: { item: ChatMessage }) => {
            const isMine = item.senderId === user?.id;
            return (
              <View
                style={[
                  styles.messageContainer,
                  isMine ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text style={[styles.messageText, isMine && styles.myMessageText]}>
                  {item.content}
                </Text>
                <Text style={[styles.timeText, isMine && styles.myTimeText]}>
                  {new Date(item.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
        />
      )}

      {isPeerTyping && (
        <View style={styles.typingWrapper}>
          <Text style={styles.typingIndicator}>{room?.peer?.name} đang nhập...</Text>
        </View>
      )}

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

            <TextInput
                style={styles.input}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor={finalColors.muted}
                value={inputText}
              onChangeText={handleTypingChange}
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
    messageList: { padding: 10, paddingBottom: 100 },
    messageLoading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyFallback: {
      color: finalColors.muted,
      fontSize: 16,
    },
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
    typingWrapper: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: finalColors.surface,
      borderTopWidth: 1,
      borderTopColor: finalColors.border,
    },
    typingIndicator: {
      color: finalColors.primary,
      fontWeight: "600",
    },
});
