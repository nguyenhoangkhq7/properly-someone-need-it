import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../config/color";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Order {
  _id: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  priceAtPurchase: number;
  status: string;
  createdAt: string;
  meetupLocation?: {
    location?: {
      type: string;
      coordinates: number[]; // [lng, lat]
    };
    address?: string;
  };
  meetupTime?: string;
}

interface Item {
  _id: string;
  title: string;
  price: number;
  images?: string[];
}

interface UserSummary {
  _id: string;
  fullName: string;
}

export default function OrderDetailScreen() {
  const route = useRoute<any>();
  const { orderId } = route.params || {};
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [buyer, setBuyer] = useState<UserSummary | null>(null);
  const [seller, setSeller] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Thiếu orderId");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`);
        const text = await res.text();
        // console.log("Get order raw response", res.status, text);

        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          setError("Phản hồi không phải JSON");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError(data?.error || "Không thể tải đơn hàng");
        } else {
          setOrder(data.order);
          setItem(data.item || null);
          setBuyer(data.buyer || null);
          setSeller(data.seller || null);
        }
      } catch (e) {
        console.error("Fetch order error", e);
        setError("Lỗi mạng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const fetchAddress = async () => {
      const coords = order?.meetupLocation?.location?.coordinates || [];
      if (!coords || coords.length !== 2) return;

      try {
        const [lng, lat] = coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: {
              "User-Agent": "properly-app/1.0 (order-detail-screen)",
            },
          }
        );

        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (res.ok && data?.display_name) {
            setResolvedAddress(data.display_name as string);
          } else {
            console.log("Reverse geocode no display_name", text);
          }
        } catch (parseErr) {
          console.log("Reverse geocode parse error", parseErr, text);
        }
      } catch (e) {
        console.log("Reverse geocode error", e);
      }
    };

    if (order) {
      fetchAddress();
    }
  }, [order]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "Không tìm thấy đơn hàng"}</Text>
      </View>
    );
  }

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

  const statusLabel = statusLabelMap[order.status] || order.status;
  const statusColor = statusColorMap[order.status] || colors.primary;

  const address = resolvedAddress || "Địa điểm sẽ được thỏa thuận sau";

  const coords = order.meetupLocation?.location?.coordinates || [];
  const hasCoords = coords.length === 2;

  const handleCancelOrder = () => {
    Alert.alert(
      "Hủy đơn mua",
      "Bạn chắc chắn muốn hủy đơn hàng này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              setCanceling(true);
              const res = await fetch(`${API_URL}/orders/${order._id}/status`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ status: "CANCELLED" }),
              });
              const data = await res.json();
              console.log("Cancel order", res.status, data);
              if (!res.ok) {
                Alert.alert("Không hủy được", data?.error || "Có lỗi xảy ra");
                return;
              }
              setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
            } catch (e) {
              Alert.alert("Không hủy được", "Lỗi mạng, thử lại sau.");
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  const canCancel =
    order.status !== "CANCELLED" && order.status !== "COMPLETED";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <Icon name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {item?.images?.length ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Icon name="cube-outline" size={22} color={statusColor} />
            <View style={{ marginLeft: 8 }}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
              <Text style={styles.statusSub}>
                Mã đơn: {order._id.slice(-8).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.timeText}>
            Thời gian tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Tên sản phẩm</Text>
            <Text style={styles.value}>
              {item?.title || "(itemId: " + order.itemId + ")"}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Giá tại thời điểm mua</Text>
            <Text style={styles.price}>{order.priceAtPurchase} đ</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin giao dịch</Text>

          <View style={styles.infoRow}>
            <Icon
              name="location-outline"
              size={20}
              color={colors.textSecondary}
            />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={styles.label}>Địa điểm gặp</Text>
              <Text style={styles.value}>{address}</Text>
              {hasCoords && (
                <Text style={styles.coordText}>
                  Tọa độ: {coords[1].toFixed(5)}, {coords[0].toFixed(5)}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin người mua / bán</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Người mua</Text>
            <Text style={styles.valueShort}>
              {buyer?.fullName || order.buyerId.slice(-8).toUpperCase()}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Người bán</Text>
            <Text style={styles.valueShort}>
              {seller?.fullName || order.sellerId.slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>

        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, canceling && { opacity: 0.6 }]}
            onPress={handleCancelOrder}
            disabled={canceling}
          >
            <Text style={styles.cancelText}>
              {canceling ? "Đang hủy..." : "HỦY ĐƠN MUA"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  container: {
    padding: 12,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  error: {
    color: "red",
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.text,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 13,
    color: colors.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  valueShort: {
    fontSize: 13,
    color: colors.text,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  coordText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 4,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.red,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
