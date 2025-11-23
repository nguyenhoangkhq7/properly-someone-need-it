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
import { LinearGradient } from "expo-linear-gradient";
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
  text: colors.text ?? "#EDEDED",
  background: colors.background ?? "#0B0C0A",
  surface: colors.surface ?? "#11120F",
  primary: colors.primary ?? "#F6FF00",
  muted: colors.muted ?? "#8A8A8A",
  border: colors.border ?? "#232621",
  success: "#32D583",
  overlay: "#1A1B17",
  bubbleMine: "#1F201B",
  bubblePeer: "#141511",
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
  type TimelineItem =
    | { type: "divider"; id: string; label: string }
    | { type: "message"; id: string; payload: ChatMessage };

  const flatListRef = useRef<FlatList<TimelineItem>>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const chatSocket = useMemo(
    () => getChatSocket(accessToken ?? null),
    [accessToken]
  );

  const conversationItem = room?.item ?? chat?.item ?? null;

  const formatDayLabel = (input: string) => {
    const targetDate = new Date(input);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = targetDate.toDateString() === today.toDateString();
    if (sameDay) return "Hôm nay";
    if (targetDate.toDateString() === yesterday.toDateString()) return "Hôm qua";

    return targetDate.toLocaleDateString();
  };

  const timelineData = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    let lastDateKey: string | null = null;
    messages.forEach((msg) => {
      const dateKey = new Date(msg.sentAt).toDateString();
      if (dateKey !== lastDateKey) {
        items.push({
          type: "divider",
          id: `divider-${dateKey}-${msg.id}`,
          label: formatDayLabel(msg.sentAt),
        });
        lastDateKey = dateKey;
      }
      items.push({ type: "message", id: msg.id, payload: msg });
    });
    return items;
  }, [messages]);

  const latestMessageId = messages[messages.length - 1]?.id;

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

  useEffect(() => {
    if (!activeRoomId) return;
    chatApi.markAsRead(activeRoomId).catch(() => {});
  }, [activeRoomId, latestMessageId]);

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

  const connectionLabel = activeRoomId ? "Đã kết nối an toàn" : "Đang kết nối...";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={finalColors.text} />
        </TouchableOpacity>
        <View style={styles.topBarInfo}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {displayInfo.name}
          </Text>
          <Text style={styles.topBarSubtitle}>{connectionLabel}</Text>
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

      <LinearGradient
        colors={["#1A1B17", "#0B0C0A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.participantCard}
      >
        <Image source={{ uri: displayInfo.avatar }} style={styles.avatarLarge} />
        <View style={{ flex: 1 }}>
          <Text style={styles.participantName}>{displayInfo.name}</Text>
          <Text style={styles.participantHint} numberOfLines={2}>
            {conversationItem?.title
              ? `Trao đổi về "${conversationItem.title}"`
              : "Giữ liên lạc nhanh chóng và rõ ràng"}
          </Text>
          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionLabel}>{connectionLabel}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* MESSAGES */}
      {(isLoadingMessages && !messages.length) || !activeRoomId ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator color={finalColors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={timelineData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.type === "divider") {
              return (
                <View style={styles.dayDivider}>
                  <Text style={styles.dayDividerText}>{item.label}</Text>
                </View>
              );
            }
            const message = item.payload;
            const isMine = message.senderId === user?.id;
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
                    {message.content}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      isMine ? styles.timeMine : styles.timeOther,
                    ]}
                  >
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListHeaderComponent={
            conversationItem ? (
              <View style={styles.productCard}>
                <Image
                  source={{ uri: conversationItem.thumbnail ?? FALLBACK_AVATAR }}
                  style={styles.productThumbnail}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productLabel}>Sản phẩm đang trao đổi</Text>
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {conversationItem.title}
                  </Text>
                  {typeof conversationItem.price === "number" && (
                    <Text style={styles.productPrice}>
                      {conversationItem.price.toLocaleString("vi-VN") + " đ"}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={finalColors.muted} />
              </View>
            ) : null
          }
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {isPeerTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.typingDot} />
          <Text style={styles.typingText}>{displayInfo.name} đang nhập...</Text>
        </View>
      )}

      {/* INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
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
            editable={!!activeRoomId}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendBtn,
              (!inputText.trim() || !activeRoomId) && { opacity: 0.4 },
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 36 : 12,
    paddingBottom: 12,
    backgroundColor: finalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: finalColors.border,
  },
  backBtn: { padding: 6, marginRight: 12 },
  topBarInfo: { flex: 1 },
  topBarTitle: { fontSize: 18, fontWeight: "700", color: finalColors.text },
  topBarSubtitle: { marginTop: 2, color: finalColors.muted, fontSize: 12 },
  headerActions: { flexDirection: "row", gap: 10 },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  avatarLarge: { width: 64, height: 64, borderRadius: 20 },
  participantName: { fontSize: 18, fontWeight: "700", color: finalColors.text },
  participantHint: { marginTop: 4, color: finalColors.textSecondary },
  connectionRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: finalColors.success,
    marginRight: 6,
  },
  connectionLabel: { color: finalColors.textSecondary, fontSize: 12, fontWeight: "600" },
  centerLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: finalColors.overlay,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: finalColors.border,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  productThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  productLabel: { fontSize: 12, color: finalColors.muted, marginBottom: 4 },
  productTitle: { fontSize: 15, color: finalColors.text, fontWeight: "600" },
  productPrice: { marginTop: 4, color: finalColors.primary, fontWeight: "700" },
  dayDivider: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  dayDividerText: { color: finalColors.textSecondary, fontSize: 12, fontWeight: "600" },
  msgRow: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
  msgRowLeft: { justifyContent: "flex-start" },
  msgRowRight: { justifyContent: "flex-end" },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 4,
  },
  msgBubble: {
    maxWidth: "78%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  bubbleMine: {
    backgroundColor: finalColors.bubbleMine,
    borderBottomRightRadius: 6,
    borderColor: "rgba(246,255,0,0.35)",
  },
  bubbleOther: {
    backgroundColor: finalColors.bubblePeer,
    borderBottomLeftRadius: 6,
    borderColor: "rgba(255,255,255,0.05)",
  },
  msgText: { fontSize: 15, lineHeight: 22 },
  textMine: { color: finalColors.primary },
  textOther: { color: finalColors.text },
  timeText: { fontSize: 10, marginTop: 6, alignSelf: "flex-end" },
  timeMine: { color: finalColors.textSecondary },
  timeOther: { color: finalColors.muted },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: finalColors.primary,
    marginRight: 8,
  },
  typingText: { fontSize: 12, color: finalColors.muted, fontStyle: "italic" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 4,
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: finalColors.overlay,
    borderWidth: 1,
    borderColor: finalColors.border,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  attachBtn: { padding: 8, marginRight: 4 },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 120,
    color: finalColors.text,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: finalColors.primary,
    marginLeft: 6,
  },
});
