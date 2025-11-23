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
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/color";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { chatApi, type ChatRoomSummary } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";
import { getChatSocket } from "../utils/chatSocket";

const finalColors = {
    ...colors,
    text: colors.text ?? "#EDEDED",
    textSecondary: colors.textSecondary ?? "#BDBDBD",
    background: colors.background ?? "#0B0C0A",
    surface: colors.surface ?? "#11120F",
    primary: colors.primary ?? "#F6FF00",
    muted: colors.muted ?? "#8A8A8A",
    border: colors.border ?? "#232621",
    accent: colors.accent ?? "#F6C200",
    overlay: "#1A1B17",
};

const FALLBACK_AVATAR = "https://placehold.co/100x100/1F1F1F/F6FF00?text=U";

type FilterKey = "all" | "unread" | "buyer" | "seller";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
    { key: "all", label: "Tất cả" },
    { key: "unread", label: "Chưa đọc" },
    { key: "buyer", label: "Người mua" },
    { key: "seller", label: "Người bán" },
];

export default function ChatListScreen() {
    const navigation = useNavigation<any>();

    const { accessToken, user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
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

    const stats = useMemo(
        () => ({
            total: rooms.length,
            unread: rooms.reduce((sum, room) => sum + (room.unreadCount ?? 0), 0),
        }),
        [rooms]
    );

    const filteredRooms = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        return rooms.filter((room) => {
            const matchesQuery = normalizedQuery
                ? room.peer.name.toLowerCase().includes(normalizedQuery) ||
                  room.item?.title?.toLowerCase().includes(normalizedQuery)
                : true;
            const matchesFilter = (() => {
                if (activeFilter === "all") return true;
                if (activeFilter === "unread") {
                    return (room.unreadCount ?? 0) > 0;
                }
                return room.role === activeFilter;
            })();
            return matchesQuery && matchesFilter;
        });
    }, [rooms, searchQuery, activeFilter]);

    const firstName = useMemo(() => {
        if (!user?.fullName) return "bạn";
        const parts = user.fullName.trim().split(" ");
        return parts[parts.length - 1] || user.fullName;
    }, [user?.fullName]);

    const renderFilterChips = () => (
        <View style={styles.filterRow}>
            {FILTERS.map((filter) => {
                const isActive = filter.key === activeFilter;
                return (
                    <TouchableOpacity
                        key={filter.key}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        onPress={() => setActiveFilter(filter.key)}
                    >
                        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                            {filter.label}
                        </Text>
                        {filter.key === "unread" && stats.unread > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>
                                    {stats.unread > 99 ? "99+" : stats.unread}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderListHeader = () => (
        <View>
            <LinearGradient
                colors={["#141511", "#0B0C0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                <View style={styles.heroHeader}>
                    <View>
                        <Text style={styles.heroEyebrow}>Xin chào</Text>
                        <Text style={styles.heroTitle}>{firstName}</Text>
                        <Text style={styles.heroSubtitle}>Quản lý mọi cuộc trò chuyện tại một nơi</Text>
                    </View>
                    <View style={styles.heroIllustration}>
                        <View style={styles.heroDot} />
                    </View>
                </View>
                <View style={styles.heroStatsRow}>
                    <View style={styles.heroStatCard}>
                        <Text style={styles.heroStatValue}>{stats.total}</Text>
                        <Text style={styles.heroStatLabel}>Cuộc trò chuyện</Text>
                    </View>
                    <View style={styles.heroStatCard}>
                        <Text style={styles.heroStatValue}>{stats.unread}</Text>
                        <Text style={styles.heroStatLabel}>Chưa đọc</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color={finalColors.muted} style={styles.searchIcon} />
                <TextInput
                    placeholder="Tìm theo tên hoặc sản phẩm"
                    placeholderTextColor={finalColors.muted}
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                        <Ionicons name="close" size={18} color={finalColors.muted} />
                    </TouchableOpacity>
                )}
            </View>
            {renderFilterChips()}
        </View>
    );

    const handleOpenRoom = useCallback(
        (targetRoom: ChatRoomSummary) => {
            navigation.navigate("ChatRoom", { room: targetRoom });
            setRooms((prev) =>
                prev.map((room) =>
                    room.roomId === targetRoom.roomId
                        ? { ...room, unreadCount: 0 }
                        : room
                )
            );
        },
        [navigation]
    );

    const renderItem = ({ item }: { item: ChatRoomSummary }) => {
        const unreadCount = item.unreadCount ?? 0;
        return (
            <TouchableOpacity
                style={[styles.chatItem, unreadCount > 0 && styles.chatItemUnread]}
                onPress={() => handleOpenRoom(item)}
            >
                <View style={styles.avatarWrapper}>
                    <Image source={{ uri: item.peer.avatar ?? FALLBACK_AVATAR }} style={styles.avatar} />
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: item.role === "buyer" ? "#32D583" : "#F79009" },
                    ]}
                    />
                </View>

                <View style={styles.chatContent}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.peer.name}</Text>
                        <Text style={styles.rolePill}>{item.role === "buyer" ? "Người mua" : "Người bán"}</Text>
                    </View>
                    {item.item?.title && (
                        <Text style={styles.itemTitle} numberOfLines={1}>
                            {item.item.title}
                        </Text>
                    )}
                    <Text
                        style={[styles.lastMessage, unreadCount > 0 && styles.unreadLastMessage]}
                        numberOfLines={1}
                    >
                        {item.lastMessage || "Chưa có tin nhắn"}
                    </Text>
                </View>

                <View style={styles.metaContainer}>
                    <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCountText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
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
                    data={filteredRooms}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.roomId}
                    contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16, flexGrow: filteredRooms.length === 0 ? 1 : undefined }}
                    ListHeaderComponent={renderListHeader}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-ellipses" size={48} color={finalColors.muted} />
                            <Text style={styles.emptyTitle}>
                                {searchQuery || activeFilter !== "all"
                                    ? "Không tìm thấy cuộc trò chuyện phù hợp"
                                    : "Chưa có cuộc trò chuyện nào"}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery || activeFilter !== "all"
                                    ? "Hãy điều chỉnh bộ lọc hoặc từ khóa tìm kiếm."
                                    : "Hãy bắt đầu trao đổi với người bán hoặc người mua."}
                            </Text>
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
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        paddingTop: 46,
        borderBottomWidth: 1,
        borderBottomColor: finalColors.border,
        backgroundColor: finalColors.surface,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        color: finalColors.text,
        fontSize: 20,
        fontWeight: "700",
        marginLeft: 10,
    },
    heroCard: {
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 24,
        padding: 20,
    },
    heroHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    heroEyebrow: {
        fontSize: 13,
        color: finalColors.muted,
        marginBottom: 2,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: finalColors.text,
    },
    heroSubtitle: {
        marginTop: 6,
        color: finalColors.textSecondary,
    },
    heroIllustration: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(246,255,0,0.16)",
        justifyContent: "center",
        alignItems: "center",
    },
    heroDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: finalColors.primary,
    },
    heroStatsRow: {
        flexDirection: "row",
        marginTop: 20,
        gap: 12,
    },
    heroStatCard: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: "rgba(17,18,15,0.8)",
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    heroStatValue: {
        fontSize: 22,
        fontWeight: "700",
        color: finalColors.text,
    },
    heroStatLabel: {
        marginTop: 4,
        color: finalColors.textSecondary,
        fontSize: 13,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: finalColors.overlay,
        borderRadius: 18,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: finalColors.border,
        minHeight: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: finalColors.text,
        fontSize: 15,
    },
    clearButton: {
        padding: 4,
    },
    filterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: finalColors.border,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: finalColors.overlay,
    },
    filterChipActive: {
        backgroundColor: "rgba(246,255,0,0.12)",
        borderColor: finalColors.primary,
    },
    filterChipText: {
        color: finalColors.textSecondary,
        fontWeight: "500",
    },
    filterChipTextActive: {
        color: finalColors.primary,
    },
    filterBadge: {
        marginLeft: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: "rgba(0,0,0,0.55)",
        borderWidth: 1,
        borderColor: finalColors.primary,
    },
    filterBadgeText: {
        color: finalColors.primary,
        fontSize: 11,
        fontWeight: "600",
    },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 20,
        backgroundColor: finalColors.overlay,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.03)",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },
    chatItemUnread: {
        borderColor: finalColors.primary,
    },
    avatarWrapper: {
        marginRight: 14,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
    },
    statusDot: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: finalColors.overlay,
    },
    chatContent: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    name: {
        color: finalColors.text,
        fontWeight: "700",
        fontSize: 16,
        marginRight: 8,
    },
    rolePill: {
        fontSize: 11,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        color: finalColors.textSecondary,
        fontWeight: "600",
    },
    itemTitle: {
        fontSize: 13,
        color: finalColors.muted,
        marginBottom: 4,
    },
    lastMessage: {
        color: finalColors.textSecondary,
        fontSize: 14,
    },
    unreadLastMessage: {
        color: finalColors.text,
        fontWeight: "700",
    },
    metaContainer: {
        alignItems: "flex-end",
        justifyContent: "space-between",
        minHeight: 54,
        marginLeft: 12,
    },
    time: {
        color: finalColors.muted,
        fontSize: 12,
    },
    unreadBadge: {
        backgroundColor: "rgba(0,0,0,0.65)",
        borderWidth: 1,
        borderColor: finalColors.primary,
        borderRadius: 12,
        minWidth: 26,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    unreadCountText: {
        color: finalColors.primary,
        fontSize: 12,
        fontWeight: "700",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    emptyTitle: {
        marginTop: 16,
        color: finalColors.text,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    emptySubtitle: {
        marginTop: 8,
        color: finalColors.muted,
        textAlign: "center",
    },
});
