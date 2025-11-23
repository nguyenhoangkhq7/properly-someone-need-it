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
import {
  chatApi,
  type ChatMessage,
  type ChatRoomSummary,
} from "../api/chatApi";
import { getChatSocket } from "../utils/chatSocket";
import { useAuth } from "../context/AuthContext";

const finalColors = {
  ...colors,
  text: colors.text || "#000",
  background: colors.background || "#FFF",
  surface: colors.surface || "#F2F2F2",
  primary: colors.primary || "#007AFF",
  muted: "#8E8E93",
  border: "#E5E5EA",
};

const TYPING_DEBOUNCE_MS = 500;
const FALLBACK_AVATAR = "https://ui-avatars.com/api/?name=User";

export default function ChatRoomScreen({ route, navigation }: any) {
  // 1. Nhận params:
  // - room: Nếu vào từ danh sách chat (đã có roomId thật).
  // - chat: Nếu vào từ trang sản phẩm (chưa có roomId thật, chỉ có sellerId nằm trong chat.roomId).
  const { room, chat, prefillMessage } = route.params || {};

  const { accessToken, user } = useAuth();

  // Xác định thông tin hiển thị (Header)
  const displayInfo = useMemo(
    () => ({
      name: room?.peer?.name || chat?.name || "Người dùng",
      avatar: room?.peer?.avatar || chat?.avatar || FALLBACK_AVATAR,
    }),
    [room, chat]
  );

  // State
  // Nếu có room.roomId thì dùng luôn, nếu không thì null đợi API trả về
  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    room?.roomId || null
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [inputText, setInputText] = useState(prefillMessage ?? "");

  // Refs
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const chatSocket = useMemo(
    () => getChatSocket(accessToken ?? null),
    [accessToken]
  );

  // --- 1. LOGIC KHỞI TẠO PHÒNG CHAT (QUAN TRỌNG) ---
  useEffect(() => {
    let mounted = true;

    const initializeRoom = async () => {
      // Trường hợp A: Đã có Room ID xịn (từ danh sách chat)
      if (room?.roomId) {
        setActiveRoomId(room.roomId);
        return;
      }

      // Trường hợp B: Vào từ trang sản phẩm (cần tìm/tạo phòng)
      // Lúc này 'chat.roomId' thực chất đang chứa 'sellerId' (do ta truyền bên ProductDetail)
      if (chat?.roomId) {
        try {
          // Gọi API Backend POST /initiate
          const realRoom = await chatApi.initiateChat(chat.roomId);

          if (mounted && realRoom?.roomId) {
            setActiveRoomId(realRoom.roomId);
          }
        } catch (error) {
          console.error("Lỗi khởi tạo phòng:", error);
          if (mounted) {
            Alert.alert("Lỗi", "Không thể kết nối tới phòng chat.");
            navigation.goBack();
          }
        }
      }
    };

    initializeRoom();
    return () => {
      mounted = false;
    };
  }, [room, chat, navigation]); // Thêm navigation vào dep

  // --- 2. XỬ LÝ MESSAGE LIST ---
  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      // Check duplicate
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
    // Auto scroll
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  // Fetch tin nhắn khi đã có activeRoomId
  useEffect(() => {
    if (!activeRoomId) return;

    let mounted = true;
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await chatApi.getMessages(activeRoomId);
        if (mounted) setMessages(data);
      } catch (error) {
        console.warn("Failed to load messages", error);
      } finally {
        if (mounted) setIsLoadingMessages(false);
      }
    };

    fetchMessages();
    return () => {
      mounted = false;
    };
  }, [activeRoomId]);

  // --- 3. SOCKET EVENTS ---
  useEffect(() => {
    if (!chatSocket || !activeRoomId) return;

    // Join Room
    chatSocket.emit("room:join", { roomId: activeRoomId });

    const handleNewMessage = (message: ChatMessage) => {
      if (message.roomId === activeRoomId) {
        appendMessage(message);
        // Mark Read
        if (message.senderId !== user?.id) {
          chatApi.markAsRead(activeRoomId).catch(() => {});
        }
      }
    };

    const handleTyping = (payload: {
      roomId: string;
      isTyping: boolean;
      userId: string;
    }) => {
      if (payload.roomId === activeRoomId && payload.userId !== user?.id) {
        setIsPeerTyping(payload.isTyping);
      }
    };

    chatSocket.on("message:new", handleNewMessage);
    chatSocket.on("typing:update", handleTyping);

    return () => {
      chatSocket.off("message:new", handleNewMessage);
      chatSocket.off("typing:update", handleTyping);
      chatSocket.emit("room:leave", { roomId: activeRoomId });
    };
  }, [chatSocket, activeRoomId, user?.id, appendMessage]);

  // --- 4. GỬI TIN NHẮN ---
  const sendMessage = useCallback(async () => {
    const content = inputText.trim();
    if (!content || !activeRoomId) return;

    setInputText(""); // Optimistic UI update

    try {
      if (chatSocket && chatSocket.connected) {
        chatSocket.emit(
          "message:send",
          { roomId: activeRoomId, content },
          (response: any) => {
            if (response?.success && response?.data) {
              appendMessage(response.data);
            } else {
              // Socket fail -> fallback API hoặc báo lỗi
              // alert("Gửi lỗi socket");
            }
          }
        );
      } else {
        // Fallback HTTP
        const msg = await chatApi.sendMessage(activeRoomId, content);
        appendMessage(msg);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi tin nhắn.");
      setInputText(content); // Rollback text
    }
  }, [inputText, activeRoomId, chatSocket, appendMessage]);

  // --- 5. TYPING ---
  const handleTypingChange = (text: string) => {
    setInputText(text);
    if (!activeRoomId || !chatSocket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      chatSocket.emit("typing:update", {
        roomId: activeRoomId,
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      chatSocket.emit("typing:update", {
        roomId: activeRoomId,
        isTyping: false,
      });
    }, TYPING_DEBOUNCE_MS);
  };

  // --- UI SETUP ---
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={finalColors.text} />
        </TouchableOpacity>

        <Image source={{ uri: displayInfo.avatar }} style={styles.avatar} />

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayInfo.name}
          </Text>
          {/* Loading status */}
          {!activeRoomId && (
            <Text style={styles.connectingText}>Đang kết nối...</Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="phone" size={20} color={finalColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="video" size={20} color={finalColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MESSAGES */}
      {(isLoadingMessages && !messages.length) || !activeRoomId ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator color={finalColors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => {
            const isMine = item.senderId === user?.id;
            return (
              <View
                style={[
                  styles.msgRow,
                  isMine ? styles.msgRowRight : styles.msgRowLeft,
                ]}
              >
                {!isMine && (
                  <Image
                    source={{ uri: displayInfo.avatar }}
                    style={styles.msgAvatar}
                  />
                )}
                <View
                  style={[
                    styles.msgBubble,
                    isMine ? styles.bubbleMine : styles.bubbleOther,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isMine ? styles.textMine : styles.textOther,
                    ]}
                  >
                    {item.content}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      isMine ? styles.timeMine : styles.timeOther,
                    ]}
                  >
                    {new Date(item.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* TYPING STATUS */}
      {isPeerTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{displayInfo.name} đang nhập...</Text>
        </View>
      )}

      {/* INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Feather name="plus" size={24} color={finalColors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={activeRoomId ? "Nhập tin nhắn..." : "Đang kết nối..."}
            placeholderTextColor={finalColors.muted}
            value={inputText}
            onChangeText={handleTypingChange}
            multiline
            editable={!!activeRoomId} // Chỉ cho nhập khi đã có phòng
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendBtn,
              (!inputText.trim() || !activeRoomId) && { opacity: 0.5 },
            ]}
            disabled={!inputText.trim() || !activeRoomId}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: finalColors.background },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: finalColors.border,
    backgroundColor: finalColors.surface,
    paddingTop: Platform.OS === "android" ? 40 : 12,
  },
  backBtn: { padding: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: finalColors.text },
  connectingText: { fontSize: 11, color: finalColors.muted },
  headerActions: { flexDirection: "row", gap: 16 },
  actionButton: { padding: 4 },

  // Message List
  centerLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  msgRow: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
  msgRowLeft: { justifyContent: "flex-start" },
  msgRowRight: { justifyContent: "flex-end" },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 4,
  },

  msgBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleMine: {
    backgroundColor: finalColors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: finalColors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: finalColors.border,
  },

  msgText: { fontSize: 15, lineHeight: 22 },
  textMine: { color: "#fff" },
  textOther: { color: finalColors.text },

  timeText: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  timeMine: { color: "rgba(255,255,255,0.7)" },
  timeOther: { color: finalColors.muted },

  // Typing
  typingContainer: { paddingHorizontal: 20, paddingBottom: 4 },
  typingText: { fontSize: 12, color: finalColors.muted, fontStyle: "italic" },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: finalColors.border,
    backgroundColor: finalColors.surface,
  },
  attachBtn: { padding: 8, marginRight: 4 },
  input: {
    flex: 1,
    backgroundColor: finalColors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: finalColors.text,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: finalColors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
