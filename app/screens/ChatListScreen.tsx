import React from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons"; 
import colors from "../config/color";
import { mockChats } from "../data/mockChats";
import { useNavigation } from "@react-navigation/native";

interface ChatItem {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unreadCount: number; 
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

export default function ChatListScreen() {
    const navigation = useNavigation<any>();

    const mockChatsWithUnread: ChatItem[] = (mockChats as ChatItem[]).map((chat, index) => ({
        ...chat,
        unreadCount: index === 0 ? 3 : (index === 2 ? 1 : 0), 
    }));

    const renderItem = ({ item }: { item: ChatItem }) => {
        const unread = item.unreadCount || 0;
        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => navigation.navigate("ChatRoom", { chat: item })}
            >
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                
                <View style={styles.chatContent}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text 
                        style={[
                            styles.lastMessage, 
                            // ✅ SỬA LỖI: Chỉ áp dụng styles.unreadLastMessage nếu count > 0
                            unread > 0 && styles.unreadLastMessage
                        ]} 
                        numberOfLines={1}
                    >
                        {item.lastMessage}
                    </Text>
                </View>

                <View style={styles.metaContainer}>
                    <Text style={styles.time}>{item.time}</Text>
                    {unread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCountText}>{unread > 99 ? '99+' : unread}</Text>
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

            <FlatList
                data={mockChatsWithUnread}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
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
    }
});
