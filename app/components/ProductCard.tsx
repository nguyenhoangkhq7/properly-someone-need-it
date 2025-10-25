// File: components/ProductCard.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import colors from "../config/color";
import type { Product } from "../data/products";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

interface ProductCardProps {
  item: Product;
}

const finalColors = {
  ...colors,
  text: colors.text || "#FFFFFF",
  textSecondary: colors.textSecondary || "#BDBDBD",
  surface: colors.surface || "#1F1F1F",
  primary: colors.primary || "#FF6B00", // Màu giảm giá (Discount)
  accent: colors.accent || "#007AFF", // Màu giá tiền hiện tại
};

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Nhãn Discount (Góc dưới bên trái) */}
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.price}</Text>
        {/* Giá gốc (Gạch ngang) */}
        {item.originalPrice && (
          <Text style={styles.originalPrice}>{item.originalPrice}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: finalColors.surface,
    borderRadius: 8,
    padding: 8, // Tăng nhẹ padding cho khớp style ProductList
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },

  // Nhãn giảm giá (Vị trí góc dưới bên trái của ảnh)
  discountBadge: {
    position: "absolute",
    left: 0,
    bottom: 0,
    backgroundColor: finalColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    zIndex: 10,
  },
  discountText: {
    color: finalColors.surface, // Chữ trắng/surface
    fontSize: 12,
    fontWeight: "700",
  },

  title: {
    color: finalColors.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-start",
  },
  price: {
    color: finalColors.accent,
    fontWeight: "700",
    fontSize: 15,
    marginRight: 8,
  },
  originalPrice: {
    color: finalColors.textSecondary,
    fontSize: 12,
    textDecorationLine: "line-through",
  },
});

export default ProductCard;
