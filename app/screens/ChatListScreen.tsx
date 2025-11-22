import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import colors from "../config/color";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { chatApi, type ChatRoomSummary } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";
import { getChatSocket } from "../utils/chatSocket";

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

const FALLBACK_AVATAR = "https://placehold.co/100x100/1F1F1F/F6FF00?text=U";

export default function ChatListScreen() {
    const navigation = useNavigation<any>();

    const { accessToken, user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const joinedRoomsRef = useRef<Set<string>>(new Set());

    const chatSocket = useMemo(() => getChatSocket(accessToken ?? null), [accessToken]);

    useEffect(() => {
        joinedRoomsRef.current.clear();
    }, [accessToken]);

    const formatTime = useCallback((timestamp: string) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return "";
        const now = new Date();
        const sameDay = date.toDateString() === now.toDateString();
        if (sameDay) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleDateString();
    }, []);

    const updateRoomSnapshot = useCallback(
        (snapshot: {
            roomId: string;
            lastMessage: string;
            lastMessageAt: string;
            buyerId: string;
            sellerId: string;
            unreadCount: { buyer: number; seller: number };
        }) => {
            if (!user) return;
            const viewerRole = snapshot.buyerId === user.id ? "buyer" : snapshot.sellerId === user.id ? "seller" : null;
            if (!viewerRole) return;

            const getTimeValue = (value: string) => {
                const dateValue = new Date(value).getTime();
                return Number.isNaN(dateValue) ? 0 : dateValue;
            };

            setRooms((prev) => {
                const next = prev.map((room) =>
                    room.roomId === snapshot.roomId
                        ? {
                              ...room,
                              lastMessage: snapshot.lastMessage,
                              lastMessageAt: snapshot.lastMessageAt,
                              unreadCount:
                                  viewerRole === "buyer"
                                      ? snapshot.unreadCount.buyer
                                      : snapshot.unreadCount.seller,
                          }
                        : room
                );

                const exists = next.some((room) => room.roomId === snapshot.roomId);
                if (!exists) {
                    return prev;
                }

                return next.sort((a, b) =>
                    getTimeValue(b.lastMessageAt) - getTimeValue(a.lastMessageAt)
                );
            });
        },
        [user]
    );

    const joinRooms = useCallback(
        (roomIds: string[]) => {
            if (!chatSocket) return;
            roomIds.forEach((roomId) => {
                if (joinedRoomsRef.current.has(roomId)) return;
                chatSocket.emit("room:join", { roomId });
                joinedRoomsRef.current.add(roomId);
            });
        },
        [chatSocket]
    );

    const loadRooms = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await chatApi.getRooms();
            setRooms(data);
            joinRooms(data.map((room) => room.roomId));
        } catch (error) {
            console.error("Failed to load chat rooms", error);
        } finally {
            setIsLoading(false);
        }
    }, [joinRooms]);

    const refreshRooms = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const data = await chatApi.getRooms();
            setRooms(data);
            joinRooms(data.map((room) => room.roomId));
        } catch (error) {
            console.error("Failed to refresh chat rooms", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [joinRooms]);

    useFocusEffect(
        useCallback(() => {
            void loadRooms();
        }, [loadRooms])
    );

    useEffect(() => {
        if (!chatSocket || !user) return;

        const handleRoomUpdate = (snapshot: any) => {
            updateRoomSnapshot(snapshot);
        };

        chatSocket.on("room:update", handleRoomUpdate);

        return () => {
            chatSocket.off("room:update", handleRoomUpdate);
        };
    }, [chatSocket, updateRoomSnapshot, user]);

    useEffect(() => {
        joinRooms(rooms.map((room) => room.roomId));
    }, [joinRooms, rooms]);

    const renderItem = ({ item }: { item: ChatRoomSummary }) => {
        const unreadCount = item.unreadCount ?? 0;
        return (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate("ChatRoom", { room: item })}
        >
            <Image source={{ uri: item.peer.avatar ?? FALLBACK_AVATAR }} style={styles.avatar} />
            
            <View style={styles.chatContent}>
                <Text style={styles.name}>{item.peer.name}</Text>
                <Text 
                    style={[
                        styles.lastMessage, 
                        unreadCount > 0 && styles.unreadLastMessage
                    ]} 
                    numberOfLines={1}
                >
                    {item.lastMessage || "Chưa có tin nhắn"}
                </Text>
            </View>

            <View style={styles.metaContainer}>
                <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
                {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCountText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="chatbubbles" size={24} color={finalColors.primary} />
                    <Text style={styles.headerTitle}>Tin nhắn</Text>
                </View>

           
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={finalColors.primary} size="large" />
                </View>
            ) : (
                <FlatList
                    data={rooms}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.roomId}
                    contentContainerStyle={{ paddingBottom: 20, flexGrow: rooms.length === 0 ? 1 : undefined }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-ellipses" size={48} color={finalColors.muted} />
                            <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
                            <Text style={styles.emptySubtitle}>Hãy bắt đầu trao đổi với người bán hoặc người mua.</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            tintColor={finalColors.primary}
                            onRefresh={() => void refreshRooms()}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: finalColors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingTop: 50, 
        borderBottomWidth: 1,
        borderBottomColor: finalColors.border,
        backgroundColor: finalColors.surface, 
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: finalColors.text,
        fontSize: 20,
        fontWeight: "700",
        marginLeft: 10,
    },
    searchButton: {
        padding: 5,
    },
    
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15, 
        paddingHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: finalColors.border,
        backgroundColor: finalColors.background,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    chatContent: {
        flex: 1,
    },
    metaContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minHeight: 50, 
    },
    name: {
        color: finalColors.text,
        fontWeight: "600",
        fontSize: 16,
    },
    lastMessage: {
        color: finalColors.textSecondary,
        fontSize: 14,
        marginTop: 3,
        fontWeight: '400', 
    },
    unreadLastMessage: {
        color: finalColors.text,
        fontWeight: '700', 
    },
    time: {
        color: finalColors.muted,
        fontSize: 12,
        marginBottom: 4,
    },
    unreadBadge: {
        backgroundColor: finalColors.primary,
        borderRadius: 15,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginTop: 4,
    },
    unreadCountText: {
        color: "#FFFFFF", 
        fontSize: 11,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        marginTop: 16,
        color: finalColors.text,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptySubtitle: {
        marginTop: 8,
        color: finalColors.muted,
        textAlign: 'center',
    },
});