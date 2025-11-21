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
  SafeAreaView,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../config/color";
import ProductItem from "../components/ProductItem";
import type { HomeStackParamList } from "../navigator/HomeNavigator";
import type { Item } from "../types/Item";
import type { SavedItem } from "../types/SavedItem";
import { productApi } from "../api/productApi";
import { getLocationLabel } from "../utils/locationLabel";
import { useUser } from "../context/UserContext";

const { width } = Dimensions.get("window");

type ProductDetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  "ProductDetail"
>;

type ItemWithDistance = Item & { distanceKm?: number };

const conditionLabel: Record<Item["condition"], string> = {
  LIKE_NEW: "Như mới",
  GOOD: "Tốt",
  FAIR: "Ổn",
  POOR: "Cũ",
};

const statusLabel: Record<Item["status"], string> = {
  ACTIVE: "Còn hàng",
  PENDING: "Có người đang mua",
  SOLD: "Đã bán",
  DELETED: "Đã xóa",
};

const lazyRequire = (name: string) => {
  try {
    // eslint-disable-next-line no-eval
    const req = eval("require");
    return req(name);
  } catch (_e) {
    return null;
  }
};

const fallbackCoords = { lat: 21.0285, lng: 105.8542 }; // Hanoi center fallback
const haversineKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  return R * c;
};

export default function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { product: initialProduct } = route.params;
  const { user } = useUser();

  const [product, setProduct] = useState<ItemWithDistance | null>(
    initialProduct as ItemWithDistance
  );
  const [related, setRelated] = useState<Item[]>([]);
  const [savedItem, setSavedItem] = useState<SavedItem | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(
    (initialProduct as ItemWithDistance)?.distanceKm ?? null
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fresh = await productApi.getById(initialProduct._id, user?._id);
        if (mounted && fresh) setProduct(fresh);
      } catch (e) {
        // giữ nguyên dữ liệu khi lỗi
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialProduct._id, user?._id]);

  const images = useMemo(
    () => (product?.images?.length ? product.images : []),
    [product]
  );
  const locationLabel = getLocationLabel(product?.location);
  const coordKey = JSON.stringify(product?.location?.coordinates || []);

  const resolveLocation = async () => {
    const Location = lazyRequire("expo-location");
    if (!Location) return null;
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm || perm.status !== "granted") return null;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (_e) {
      return null;
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (distanceKm != null) return;
      const c = product?.location?.coordinates;
      if (!c || c.length < 2) return;
      const loc = coords || (await resolveLocation()) || fallbackCoords;
      if (!coords) setCoords(loc);
      const [lng, lat] = c;
      const km = haversineKm(loc, { lat, lng });
      if (active) setDistanceKm(Math.round(km * 10) / 10);
    })();
    return () => {
      active = false;
    };
  }, [coordKey, distanceKm, coords]);

  const locationText =
    distanceKm != null
      ? `${locationLabel} - Khoảng cách ~${distanceKm} km`
      : locationLabel;

  const handleMessagePress = (preset?: string) => {
    const chatPayload = {
      name: "Người bán",
      avatar: product?.images?.[0] || "https://picsum.photos/200",
      roomId: product?._id || "",
    };
    navigation.navigate("Chat", {
      screen: "ChatRoom",
      params: { chat: chatPayload, prefillMessage: preset },
    });
  };

  const handleToggleSave = () => {
    if (savedItem) {
      setSavedItem(null);
    } else if (product) {
      setSavedItem({
        itemId: product._id,
        savedAt: new Date().toISOString(),
        title: product.title,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleToggleSave}>
            <Icon
              name={savedItem ? "heart" : "heart-outline"}
              size={24}
              color={savedItem ? colors.primary : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => handleMessagePress()}
          >
            <Icon name="chatbubble-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            keyExtractor={(uri, idx) => `${uri}-${idx}`}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: uri }) => (
              <Image source={{ uri }} style={styles.productImage} />
            )}
            ListEmptyComponent={
              <View style={styles.productImage}>
                <Text style={styles.imageCounterText}>Không có ảnh</Text>
              </View>
            }
          />
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {`Hình ${images.length ? 1 : 0}/${images.length || 0}`}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.section}>
          <Text style={styles.productTitle}>{product?.title}</Text>
          <Text style={styles.productPrice}>
            {product ? `${product.price.toLocaleString()} đ` : ""}
          </Text>
          <View style={styles.detailRow}>
            <Icon
          name="location-outline"
          size={16}
          color={colors.textSecondary}
          style={{ marginRight: 4 }}
        />
        <Text style={styles.detailValue}>{locationText}</Text>
      </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trạng thái:</Text>
            <Text style={styles.detailValue}>
              {product ? statusLabel[product.status] : ""}
            </Text>
          </View>
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.ctaPrimary, styles.ctaSpacing]}
              onPress={() =>
                handleMessagePress(
                  "Xin chào, mình muốn thương lượng giá sản phẩm này."
                )
              }
            >
              <Text style={styles.ctaPrimaryText}>Thương lượng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => handleMessagePress()}
            >
              <Text style={styles.ctaPrimaryText}>Mua ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tình trạng:</Text>
            <Text style={styles.detailValue}>
              {product ? conditionLabel[product.condition] : ""}
            </Text>
            <Icon
              name="information-circle-outline"
              size={16}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Danh mục:</Text>
            <Text style={styles.detailValue}>{product?.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thỏa thuận giá:</Text>
            <Text style={styles.detailValue}>
              {product?.isNegotiable ? "Có" : "Không"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mô tả:</Text>
          </View>
          <Text style={styles.descriptionText}>{product?.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người bán</Text>
          <View style={styles.sellerInfo}>
            <Image
              source={require("../../assets/peopple.jpg")}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>Người bán</Text>
              <Text style={styles.sellerStats}>
                ID: {product?.sellerId || "Đang cập nhật"}
              </Text>
              <Text style={styles.sellerStats}>Hoạt động gần đây</Text>
            </View>
          </View>
          <View style={styles.sellerButtons}>
            <TouchableOpacity
              style={styles.sellerButton}
              onPress={() => navigation.navigate("ShopScreen", { shop: {} })}
            >
              <Text style={styles.sellerButtonText}>XEM SHOP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sellerButton}
              onPress={() =>
                navigation.navigate("HomeStack", {
                  screen: "SearchResults",
                })
              }
            >
              <Text style={styles.sellerButtonText}>SẢN PHẨM</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Other Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm khác</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("HomeStack", { screen: "SearchResults" })
              }
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={related}
            renderItem={({ item }) => <ProductItem product={item} horizontal />}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: (StatusBar.currentHeight || 0) + 16,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerButton: {
    padding: 8,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: width,
    height: width * 0.85,
  },
  productImage: {
    width: width,
    height: width * 0.85,
  },
  imageCounter: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  imageCounterText: {
    color: colors.text,
    fontSize: 12,
  },
  section: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  divider: {
    height: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  productTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "bold",
    lineHeight: 24,
  },
  productPrice: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "800",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    width: 120,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    marginRight: 8,
    flex: 1,
  },
  ctaRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  ctaSpacing: {
    marginRight: 8,
  },
  ctaPrimary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  ctaPrimaryText: {
    color: colors.background,
    fontWeight: "800",
    fontSize: 13,
    textTransform: "uppercase",
  },
  descriptionText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  sellerDetails: {
    marginLeft: 12,
  },
  sellerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  sellerStats: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  sellerButtons: {
    flexDirection: "row",
    marginTop: 15,
  },
  sellerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  sellerButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
