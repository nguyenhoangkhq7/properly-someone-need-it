import React, { useEffect, useState, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from "react-native";
import colors from "../config/color";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigator/HomeNavigator";
import type { Item } from "../types/Item";
import type { ItemWithDistance } from "../types/Item"; // Hoặc import type mở rộng của bạn
import {
  getLocationLabelAsync,
  getLocationLabel,
} from "../utils/locationLabel";

interface Props {
  product: ItemWithDistance; // Dùng type chính xác
  horizontal?: boolean;
}

const ProductItem = ({ product, horizontal = false }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  // Khởi tạo state location (Giảm thiểu flash layout)
  const [locationLabel, setLocationLabel] = useState(() =>
    getLocationLabel(product.location)
  );

  const hasDistance =
    typeof product.distanceKm === "number" &&
    Number.isFinite(product.distanceKm);

  useEffect(() => {
    let mounted = true;
    // Chỉ gọi async nếu label đồng bộ chưa có hoặc cần update chi tiết
    getLocationLabelAsync(product.location).then((label) => {
      if (mounted && label && label !== locationLabel) {
        setLocationLabel(label);
      }
    });
    return () => {
      mounted = false;
    };
  }, [product.location]); // Bỏ locationLabel khỏi dependency để tránh loop

  // Dynamic Style cho container
  const containerStyle: ViewStyle = horizontal
    ? { width: 160, marginRight: 12 } // Horizontal cần width cố định & margin phải
    : { width: "100%", marginBottom: 12 }; // Vertical cần full width cột & margin dưới

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, containerStyle]}
      onPress={() => navigation.navigate("ProductDetail", { product })}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images?.[0] }} // Safe access
          style={styles.image}
          resizeMode="cover"
        />
        {/* Badge Tình trạng (Optional) */}
        {product.condition === "LIKE_NEW" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Like New</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price} numberOfLines={1}>
            {product.price.toLocaleString()} đ
          </Text>
        </View>

        {/* Distance & Location */}
        <View style={styles.footerRow}>
          {hasDistance && (
            <View style={styles.distanceTag}>
              <Ionicons name="navigate" size={10} color={colors.primary} />
              <Text style={styles.distanceText}>{product.distanceKm} km</Text>
            </View>
          )}

          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={12}
              color={colors.textSecondary}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Tối ưu Performance: Chỉ render lại khi prop thay đổi
export default memo(ProductItem, (prev, next) => {
  return (
    prev.product._id === next.product._id &&
    prev.product.distanceKm === next.product.distanceKm &&
    prev.horizontal === next.horizontal
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    // BỎ marginHorizontal cố định để tránh lệch Grid
    // Shadow nhẹ nhàng hơn
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden", // Bo tròn cả ảnh
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1, // Vuông vức, đẹp hơn fix height
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 10,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    minHeight: 40, // Giữ chiều cao cố định cho 2 dòng để items bằng nhau
    marginBottom: 4,
  },
  priceRow: {
    marginBottom: 8,
  },
  price: {
    color: colors.accent, // Màu cam/đỏ nổi bật
    fontWeight: "700",
    fontSize: 15,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  distanceTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background, // Hoặc màu tối nhẹ
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 2,
  },
  distanceText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Để text location co giãn
    justifyContent: "flex-end",
    gap: 2,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 11,
    maxWidth: "80%", // Tránh bị tràn
  },
});
