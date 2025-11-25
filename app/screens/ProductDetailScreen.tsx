// screens/ProductDetailScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Dùng cái này thay cho View thường để tránh tai thỏ
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as Location from "expo-location"; // Import trực tiếp, không dùng eval

import colors from "../config/color";
import ProductItem from "../components/ProductItem";
import type { HomeStackParamList } from "../navigator/HomeNavigator";
import type { Item } from "../types/Item";
import type { SavedItem } from "../types/SavedItem";
import { productApi } from "../api/productApi";
import {
  getLocationLabel,
  getLocationLabelAsync,
} from "../utils/locationLabel";
import { getUserLatLng, haversineKm, roundDistanceKm } from "../utils/distance";
import { apiClient } from "../api/apiWrapper";
import { useAuth } from "../context/AuthContext";
import { chatApi, type ChatRoomSummary } from "../api/chatApi";
import api, { ApiResponse } from "../api/axiosClient";

const { width } = Dimensions.get("window");

type ProductDetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  "ProductDetail"
>;

// Type mở rộng để hiển thị UI
type ItemWithDistance = Item & { distanceKm?: number };
type SellerInfo = {
  _id: string;
  fullName: string;
  avatar?: string;
  rating: number; // Trong model là required, có default
  reviewCount: number;
  successfulTrades: number;
  lastActiveAt: string; // JSON trả về string date
  createdAt: string; // Ngày tham gia
  isVerified: boolean; // Tích xanh
  address: {
    city: string;
    district?: string;
  };
};

// Map labels
const CONDITION_MAP: Record<string, string> = {
  LIKE_NEW: "Như mới",
  GOOD: "Tốt",
  FAIR: "Ổn",
  POOR: "Cũ",
};
const STATUS_MAP: Record<string, string> = {
  ACTIVE: "Còn hàng",
  PENDING: "Đang giao dịch",
  SOLD: "Đã bán",
  DELETED: "Đã xóa",
};

export default function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { product: initialProduct } = route.params;
  const { user, accessToken } = useAuth();

  // State
  const [product, setProduct] = useState<ItemWithDistance>(initialProduct);
  const [related, setRelated] = useState<Item[]>([]);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [savedItem, setSavedItem] = useState<SavedItem | null>(null);
  const [locationLabel, setLocationLabel] = useState(
    getLocationLabel(initialProduct.location)
  );
  const [distance, setDistance] = useState<number | null>(
    (initialProduct as any).distanceKm ?? null
  );

  const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://playvault.vn";

  // 1. Fetch Product Detail & Seller
  // 1. Fetch Product Detail & Seller
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // A. CHUẨN BỊ CÁC PROMISE

        // 1. Lấy thông tin sản phẩm (Giữ nguyên nếu productApi đã ổn, hoặc chuyển sang dùng api tương tự)
        const productPromise = productApi
          .getById(initialProduct._id, user?.id)
          .catch((err) => {
            console.warn("Lỗi lấy chi tiết sản phẩm:", err);
            return null;
          });

        // 2. Lấy thông tin Người bán (ĐÃ SỬA ĐỔI)
        // Sử dụng api instance mới có Auth Interceptor
        const sellerPromise = api
          .get<ApiResponse<SellerInfo>>(
            `/users/${initialProduct.sellerId}/profile`
          )
          .then((response) => {
            // Axios trả về response, response.data là ApiResponse, response.data.data mới là SellerInfo
            return response.data.data;
          })
          .catch((err) => {
            // err ở đây sẽ là ApiClientError (do interceptor đã xử lý)
            console.warn("Lỗi lấy thông tin seller:", err);
            return null;
          });

        // B. THỰC THI (Phần dưới này giữ nguyên logic cũ vì sellerPromise đã trả về data sạch hoặc null)
        const [freshProduct, sellerData] = await Promise.all([
          productPromise,
          sellerPromise,
        ]);

        if (!mounted) return;

        // C. CẬP NHẬT STATE
        if (freshProduct) {
          setProduct(freshProduct);
        }

        if (sellerData) {
          setSeller(sellerData); // Lúc này sellerData đã đúng kiểu SellerInfo
        }

        // D. LẤY SẢN PHẨM KHÁC (RELATED)
        const currentSellerId =
          freshProduct?.sellerId || initialProduct.sellerId;

        if (currentSellerId) {
          try {
            // Nếu muốn chuyển productApi sang dùng api auth luôn thì sửa ở đây,
            // hiện tại tôi giữ nguyên logic cũ của bạn.
            const allItems = await productApi.getAll();
            const others = allItems
              .filter(
                (item) =>
                  item.sellerId === currentSellerId &&
                  item._id !== initialProduct._id &&
                  item.status === "ACTIVE"
              )
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 6);

            if (mounted) setRelated(others);
          } catch (e) {
            console.warn("Lỗi lấy sản phẩm liên quan:", e);
          }
        }
      } catch (e) {
        console.warn("Tổng hợp lỗi loadData:", e);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [initialProduct._id, initialProduct.sellerId, user?.id]);

  // 2. Logic Tính Khoảng Cách & Location Label (Tối ưu hóa)
  useEffect(() => {
    let mounted = true;

    const calculateDistance = async () => {
      // a. Lấy label địa chỉ chi tiết (Async)
      getLocationLabelAsync(product.location).then((label) => {
        if (mounted && label) setLocationLabel(label);
      });

      // b. Tính khoảng cách
      // Coordinates trong MongoDB/GeoJSON là [Longitude, Latitude]
      const productCoords = product.location?.coordinates;
      if (!productCoords || productCoords.length !== 2) return;
      const [pLng, pLat] = productCoords;

      // Ưu tiên 1: Vị trí set trong Profile user
      let origin = getUserLatLng(user);

      // Ưu tiên 2: GPS thực tế (nếu profile chưa set)
      if (!origin) {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === "granted") {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            origin = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          }
        } catch (e) {
          /* Ignore GPS error */
        }
      }

      if (origin && mounted) {
        const km = haversineKm(origin, { lat: pLat, lng: pLng });
        setDistance(roundDistanceKm(km));
      }
    };

    calculateDistance();
    return () => {
      mounted = false;
    };
  }, [product.location, user]); // Dependency rõ ràng

  // Helpers UI
  const images = useMemo(
    () => (product.images?.length ? product.images : []),
    [product.images]
  );

  const handleMessagePress = async (preset?: string) => {
    if (!user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để chat với người bán");
      return;
    }

    if (user.id === product.sellerId) {
      Alert.alert("Thông báo", "Bạn không thể tự chat với chính mình");
      return;
    }

    let room: ChatRoomSummary | null = null;
    try {
      room = await chatApi.initiateChat(product.sellerId);
    } catch (error: any) {
      const message =
        error?.message ?? "Không mở được phòng chat, thử lại sau.";
      Alert.alert("Không thể mở chat", message);
      return;
    }

    // --- ĐOẠN CODE QUAN TRỌNG CẦN SỬA ---

    // Sử dụng initial: false để chèn ChatList xuống dưới ChatRoom
    navigation.navigate("Chat", {
      screen: "ChatRoom",
      params: { room, prefillMessage: preset },
      initial: false, // <--- THÊM DÒNG NÀY: Phép thuật nằm ở đây
    });
  };

  const handleToggleSave = () => {
    if (savedItem) setSavedItem(null); // Logic gọi API delete save ở đây
    else
      setSavedItem({
        itemId: product._id,
        savedAt: new Date().toISOString(),
        title: product.title,
      }); // Logic gọi API save ở đây
  };

  // Hàm chọn mua ngay (Phúc Vinh)
  const createOrder = async () => {
    try {
      // setIsBuying(true);

      // Tạm thời dùng cứng một _id item thật trong Mongo để test mua hàng
      const itemId = product?._id;

      if (!accessToken) {
        // Nếu chưa đăng nhập, chuyển tới màn Login
        navigation.navigate("Auth", { screen: "Login" });
        return;
      }

      // Kiểm tra không cho phép mua sản phẩm của chính mình
      if (user?.id === product.sellerId) {
        Alert.alert("Lỗi", "Bạn không thể mua sản phẩm của chính mình");
        return;
      }

      // Kiểm tra trạng thái sản phẩm
      if (product.status !== "ACTIVE") {
        Alert.alert("Lỗi", "Sản phẩm này không còn khả dụng để mua");
        return;
      }

      const response = await api.post("/orders", { itemId });
      navigation.navigate("OrderDetail", {
        orderId: response.data.order._id,
      });
    } catch (e: any) {
      console.error("Create order error", e);
      const errorMessage =
        e?.response?.data?.message || e?.message || "Không thể tạo đơn hàng";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      // setIsBuying(false);
    }
  };

  // Hỏi xác nhận trước khi mua
  const handleBuyNow = () => {
    Alert.alert("Xác nhận mua", "Bạn có muốn mua sản phẩm này không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Mua", onPress: () => createOrder() },
    ]);
  };

  const handleShareProduct = async () => {
    try {
      // 1. Tạo nội dung tin nhắn muốn chia sẻ
      // Bạn nên thay thế 'https://playvault.vn' bằng domain thật hoặc Deep Link của app bạn
      const appLink = `${WEB_URL}/products/${product._id}`;

      const message = [
        `🔥 ${product.title}`,
        `💰 Giá: ${product.price.toLocaleString()} đ`,
        `📍 Khu vực: ${locationLabel}`,
        `👉 Xem chi tiết tại: ${appLink}`,
      ].join("\n"); // Nối các dòng lại với nhau

      // 2. Gọi API Share
      const result = await Share.share({
        message: message, // Nội dung chính (Android + iOS)
        title: product.title, // Tiêu đề hộp thoại (Android)
        url: appLink, // iOS thường dùng cái này để nhận diện link
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Đã chia sẻ qua một app cụ thể (chỉ iOS mới trả về cái này)
          console.log("Shared with activity type: " + result.activityType);
        } else {
          // Đã chia sẻ thành công
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        // Người dùng hủy bỏ chia sẻ (iOS)
        console.log("Dismissed");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleToggleSave}>
            <Icon
              name={savedItem ? "heart" : "heart-outline"}
              size={24}
              color={savedItem ? colors.primary : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShareProduct}>
            <Icon name="share-social-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            )}
            ListEmptyComponent={
              <View style={[styles.mainImage, styles.center]}>
                <Text style={{ color: colors.textSecondary }}>Chưa có ảnh</Text>
              </View>
            }
          />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>1/{images.length || 1}</Text>
          </View>
        </View>

        {/* Main Info Section */}
        <View style={styles.section}>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {STATUS_MAP[product.status] || "Chi tiết"}
              </Text>
            </View>
          </View>

          {/* CẢI TIẾN: Khu vực Location & Distance Cân đối */}
          <View style={styles.locationContainer}>
            <View style={styles.locationLeft}>
              <Icon name="location-sharp" size={18} color={colors.primary} />
              <Text style={styles.addressText} numberOfLines={2}>
                {locationLabel}
              </Text>
            </View>

            {/* Hiển thị khoảng cách như một Badge riêng biệt */}
            {distance !== null && (
              <View style={styles.distanceBadge}>
                <Icon
                  name="navigate-circle-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.distanceText}>{distance} km</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.detailGrid}>
            <DetailItem
              label="Tình trạng"
              value={CONDITION_MAP[product.condition]}
            />
            <DetailItem label="Danh mục" value={product.category} />
            <DetailItem
              label="Thương lượng"
              value={product.isNegotiable ? "Có" : "Không"}
            />
            <DetailItem
              label="Đăng lúc"
              value={new Date(product.createdAt).toLocaleDateString()}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
            Mô tả sản phẩm
          </Text>
          <Text style={styles.description}>
            {product.description || "Người bán chưa thêm mô tả."}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Seller Profile */}
        <View style={styles.section}>
          <View style={styles.sellerHeader}>
            <View>
              <Image
                source={{
                  uri:
                    seller?.avatar ||
                    "https://ui-avatars.com/api/?name=" +
                      (seller?.fullName || "User"),
                }}
                style={styles.avatar}
              />
              {/* Hiển thị tích xanh nếu user đã verify */}
              {seller?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </View>

            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>
                {seller?.fullName || "Người bán"}
              </Text>

              <View style={styles.ratingRow}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {seller?.rating?.toFixed(1) || "5.0"} •{" "}
                  {seller?.reviewCount || 0} đánh giá
                </Text>
              </View>

              <Text style={styles.sellerSubText}>
                Đã bán: {seller?.successfulTrades || 0} • Tham gia:{" "}
                {seller?.createdAt
                  ? new Date(seller.createdAt).getFullYear()
                  : "--"}
              </Text>

              <Text style={styles.sellerSubText}>
                {seller?.address?.district
                  ? `${seller.address.district}, `
                  : ""}
                {seller?.address?.city || "Toàn quốc"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewShopBtn}
              onPress={() => {
                const fallbackSellerId = seller?._id ?? product.sellerId;
                navigation.navigate("ShopScreen", {
                  shop: {
                    sellerId: fallbackSellerId,
                    ownerId: seller?._id ?? product.sellerId,
                    avatar: seller?.avatar,
                    name: seller?.fullName ?? "Người bán",
                    rating: seller?.rating ?? 5,
                    totalProducts: related.length || 0,
                    sold: seller?.successfulTrades ?? 0,
                    reviewCount: seller?.reviewCount ?? 0,
                  },
                });
              }}
            >
              <Text style={styles.viewShopText}>Xem Shop</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Related Products */}
        {related.length > 0 && (
          <View style={[styles.section, { paddingBottom: 20 }]}>
            <Text style={styles.sectionTitle}>Sản phẩm khác từ Shop</Text>
            <FlatList
              data={related}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <ProductItem product={item} horizontal />
              )}
              keyExtractor={(i) => i._id}
              contentContainerStyle={{ gap: 12, paddingTop: 10 }}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatBtn} // Style mới
          onPress={() =>
            handleMessagePress("Mình muốn hỏi thêm về sản phẩm này")
          }
          activeOpacity={0.7}
        >
          <Icon
            name="chatbubble-ellipses-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.chatBtnText}>Chat ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => handleBuyNow()}
          activeOpacity={0.8}
        >
          <Text style={styles.buyBtnText}>MUA NGAY</Text>
          <Icon
            name="arrow-forward"
            size={20}
            color="#000"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Component nhỏ để hiển thị dòng thông tin (Clean Code)
const DetailItem = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "--"}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRight: { flexDirection: "row", gap: 16 },
  iconBtn: { padding: 4 },

  // Carousel
  carouselContainer: {
    width: width,
    height: width * 0.85,
    position: "relative",
  },
  mainImage: { width: width, height: width * 0.85, backgroundColor: "#f0f0f0" },
  imageBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  // Sections
  section: { padding: 16, backgroundColor: colors.surface },
  divider: { height: 8, backgroundColor: colors.background },

  // Main Info
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  price: { fontSize: 24, fontWeight: "800", color: colors.accent },
  statusBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: { fontSize: 12, color: colors.textSecondary },

  // Location Styles (TỐI ƯU HIỂN THỊ)
  locationContainer: {
    flexDirection: "row",
    alignItems: "center", // Căn giữa theo chiều dọc
    justifyContent: "space-between", // Đẩy 2 bên ra xa
    backgroundColor: colors.background, // Nền nhẹ làm nổi bật
    padding: 12,
    borderRadius: 8,
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  addressText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2c2c2e", // Màu xám đen (giống màu than chì)
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary, // Chữ Vàng trên nền Đen -> Rất nổi
  },

  // Details
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  detailGrid: { gap: 8 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  detailLabel: { color: colors.textSecondary, fontSize: 14 },
  detailValue: { color: colors.text, fontSize: 14, fontWeight: "500" },
  description: { fontSize: 15, lineHeight: 24, color: colors.text },

  // Seller
  sellerHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#eee" }, // Avatar to hơn xíu

  // Badge tích xanh nhỏ ở góc avatar
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary, // Hoặc màu xanh dương
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  sellerInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  sellerName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  ratingText: { fontSize: 13, color: colors.text, fontWeight: "500" },

  sellerSubText: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },

  viewShopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
  },
  viewShopText: { fontSize: 12, color: colors.primary, fontWeight: "600" },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16, // Padding 2 bên
    paddingTop: 12,
    paddingBottom: 24, // Padding đáy lớn hơn cho các máy tai thỏ/không nút home
    backgroundColor: colors.surface, // Nền trắng sạch sẽ
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)", // Viền mờ tinh tế hơn
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    gap: 12, // (Quan trọng) Tạo khoảng cách đều giữa 2 nút
  },

  // Nút Chat (Style Outlined - Viền vàng, nền trắng)
  chatBtn: {
    flex: 1, // Cân đối: Chiếm 50% chiều ngang
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface, // Nền trắng
    borderWidth: 2, // Độ dày viền
    borderColor: colors.primary, // Viền màu vàng
    borderRadius: 12, // Bo tròn hiện đại hơn
    height: 50, // Tăng chiều cao một chút cho dễ bấm
  },
  chatBtnText: {
    color: colors.primary, // Chữ màu vàng
    fontWeight: "700",
    fontSize: 16,
  },

  // Nút Mua Ngay (Style Solid - Nền vàng, chữ ĐEN)
  buyBtn: {
    flex: 1, // Cân đối: Chiếm 50% chiều ngang
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary, // Nền vàng
    borderRadius: 12,
    height: 50,
    // Thêm shadow nhẹ cho nút mua để nổi bật hẳn lên
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buyBtnText: {
    color: "#000000", // QUAN TRỌNG: Chữ màu ĐEN trên nền vàng để dễ đọc nhất
    fontWeight: "800",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5, // Giãn chữ nhẹ cho sang
  },
});
