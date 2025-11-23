import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import colors from "../config/color";
import { useAuth } from "../context/AuthContext";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Item {
  _id: string;
  title: string;
  price: number;
  images?: string[];
  createdAt?: string;
  status: "ACTIVE" | "PENDING" | "SOLD" | "DELETED";
}

export default function MySellingItemsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!user?.id) {
      setError("Chưa đăng nhập");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const res = await fetch(
        `${API_URL}/items/seller/${user.id}`
      );
      const text = await res.text();
      console.log("Get my selling items", res.status, text);

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setError("Phản hồi không phải JSON");
        return;
      }

      if (!res.ok) {
        setError(data?.message || "Không thể lấy danh sách sản phẩm");
        return;
      }

      setItems(data.items || []);
    } catch (e) {
      console.error("Get my selling items error", e);
      setError("Lỗi mạng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const renderItem = ({ item }: { item: Item }) => {
    const firstImage = item.images?.[0];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("MySellingItemDetail", { itemId: item._id })
        }
      >
        <View style={styles.card}>
          <View style={styles.row}>
            {firstImage ? (
              <Image source={{ uri: firstImage }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Icon
                  name="image-outline"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.price}>{item.price} đ</Text>
              <Text
                style={[
                  styles.status,
                  item.status === "ACTIVE" && styles.statusActive,
                  item.status === "PENDING" && styles.statusPending,
                  item.status === "SOLD" && styles.statusSold,
                  item.status === "DELETED" && styles.statusDeleted,
                ]}
              >
                {item.status === "ACTIVE"
                  ? "Đang đăng"
                  : item.status === "PENDING"
                  ? "Đang chờ"
                  : item.status === "SOLD"
                  ? "Đã bán"
                  : "Đã xóa"}
              </Text>
              {item.createdAt && (
                <Text style={styles.timeText}>
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBack}
        >
          <Icon name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm đang bán</Text>
        <View style={{ width: 32 }} />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Bạn chưa đăng bán sản phẩm nào</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerBack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  price: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  timeText: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  status: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
  },
  statusActive: {
    color: "#2e7d32",
  },
  statusPending: {
    color: "#f9a825",
  },
  statusSold: {
    color: "#1565c0",
  },
  statusDeleted: {
    color: "#9e9e9e",
  },
  errorText: {
    fontSize: 13,
    color: "red",
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
