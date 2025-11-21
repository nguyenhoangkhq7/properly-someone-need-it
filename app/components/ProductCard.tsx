// components/ProductCard.tsx
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
import type { Item } from "../types/Item";
import { getLocationLabel } from "../utils/locationLabel";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

interface ProductCardProps {
  item: Item;
  onPress?: () => void;
}

const finalColors = {
  ...colors,
  text: colors.text || "#FFFFFF",
  textSecondary: colors.textSecondary || "#BDBDBD",
  surface: colors.surface || "#1F1F1F",
  primary: colors.primary || "#FF6B00",
  accent: colors.accent || "#007AFF",
};

const ProductCard: React.FC<ProductCardProps> = ({ item, onPress }) => {
  const locationLabel = getLocationLabel(item.location);
  const imageUri = item.images?.[0];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
      </View>
      <Text style={styles.location} numberOfLines={1}>
        {locationLabel}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: finalColors.surface,
    borderRadius: 10,
    padding: 8,
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
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: finalColors.background,
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { color: finalColors.textSecondary, fontSize: 12 },
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
  },
  price: {
    color: finalColors.accent,
    fontWeight: "700",
    fontSize: 15,
    marginRight: 8,
  },
  location: {
    color: finalColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default ProductCard;
