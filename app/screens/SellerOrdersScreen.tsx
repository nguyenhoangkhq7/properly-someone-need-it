import React, { useEffect, useState, useCallback } from "react";
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

const statusLabelMap: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  NEGOTIATING: "Đang thương lượng",
  MEETUP_SCHEDULED: "Đã hẹn giao dịch",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusColorMap: Record<string, string> = {
  PENDING: "#f97316",
  NEGOTIATING: "#0ea5e9",
  MEETUP_SCHEDULED: "#22c55e",
  COMPLETED: "#16a34a",
  CANCELLED: "#ef4444",
};

interface SellerOrderItem {
  order: {
    _id: string;
    status: string;
    createdAt: string;
    priceAtPurchase: number;
  };
  item: {
    _id: string;
    title: string;
    images?: string[];
  } | null;
  buyer: {
    _id: string;
    fullName: string;
  } | null;
}

export default function SellerOrdersScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<SellerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | string>("ALL");

  const fetchOrders = async () => {
    if (!user?.id) {
      setError("Chưa đăng nhập");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const query =
        filterStatus && filterStatus !== "ALL"
          ? `?status=${encodeURIComponent(filterStatus)}`
          : "";
      const res = await fetch(
        `${API_URL}/orders/seller/${user.id}${query}`
      );
      const text = await res.text();
      console.log("Get seller orders", res.status, text);
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setError("Phản hồi không phải JSON");
        return;
      }
      if (!res.ok) {
        setError(data?.error || "Không thể lấy đơn bán");
        return;
      }
      setOrders(data.orders || []);
    } catch (e) {
      console.error("Get seller orders error", e);
      setError("Lỗi mạng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [filterStatus])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      console.log("Update order status", res.status, data);
      if (!res.ok) return;
      fetchOrders();
    } catch (e) {
      console.error("Update status error", e);
    }
  };

  const renderOrder = ({ item }: { item: SellerOrderItem }) => {
    const { order, buyer } = item;
    const firstImage = item.item?.images?.[0];
    const statusLabel = statusLabelMap[order.status] || order.status;
    const statusColor = statusColorMap[order.status] || colors.primary;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("HomeStack", {
            screen: "OrderDetail",
            params: { orderId: order._id },
          })
        }
      >
        <View style={styles.card}>
          <View style={styles.row}>
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Icon name="image-outline" size={24} color={colors.textSecondary} />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.title} numberOfLines={1}>
              {item.item?.title || "(Sản phẩm đã xóa)"}
            </Text>
            <Text style={styles.price}>{order.priceAtPurchase} đ</Text>
            <Text style={styles.buyerText}>
              Người mua: {buyer?.fullName || buyer?._id || "Không rõ"}
            </Text>
            <Text style={styles.timeText}>
              {new Date(order.createdAt).toLocaleString("vi-VN")}
            </Text>
          </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.statusBadge}>
              <Icon name="cube-outline" size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              {order.status === "PENDING" && (
                <TouchableOpacity
                  style={styles.actionButtonPrimary}
                  onPress={() => handleUpdateStatus(order._id, "MEETUP_SCHEDULED")}
                >
                  <Text style={styles.actionPrimaryText}>XÁC NHẬN HẸN</Text>
                </TouchableOpacity>
              )}
              {order.status === "MEETUP_SCHEDULED" && (
                <>
                  <TouchableOpacity
                    style={styles.actionButtonSecondary}
                    onPress={() => handleUpdateStatus(order._id, "COMPLETED")}
                  >
                    <Text style={styles.actionSecondaryText}>HOÀN THÀNH</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButtonSecondary}
                    onPress={() => handleUpdateStatus(order._id, "CANCELLED")}
                  >
                    <Text style={styles.actionSecondaryText}>HỦY</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filters: { key: "ALL" | string; label: string }[] = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xác nhận" },
    { key: "MEETUP_SCHEDULED", label: "Đã hẹn" },
    { key: "COMPLETED", label: "Hoàn thành" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

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
        <Text style={styles.headerTitle}>Đơn bán hàng</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.filterRowWrapper}>
        <FlatList
          data={filters}
          horizontal
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => {
            const active = filterStatus === f.key;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilterStatus(f.key)}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Chưa có đơn bán nào</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.order._id}
          renderItem={renderOrder}
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
  filterRowWrapper: {
    backgroundColor: colors.surface,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.background,
    fontWeight: "600",
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
  buyerText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeText: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  footerRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionPrimaryText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.background,
  },
  actionButtonSecondary: {
    marginLeft: 8,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionSecondaryText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
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
