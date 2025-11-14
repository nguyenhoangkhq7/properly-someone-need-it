// components/ProductItem.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import colors from "../config/color";
import { Product } from "../data/products";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigator/HomeNavigator";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

interface Props {
  product: Product;
  horizontal?: boolean;
}

export default function ProductItem({ product, horizontal = false }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  return (
    <TouchableOpacity
      style={[styles.card, { width: horizontal ? 150 : cardWidth }]}
      onPress={() => navigation.navigate("ProductDetail", { product })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>

      <View style={styles.priceRow}>
        <View style={styles.priceTag}>
          <Text style={styles.price}>{product.price}</Text>
        </View>
        {product.originalPrice && (
          <Text style={styles.original}>{product.originalPrice}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 6,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#0f100f",
  },
  image: { width: "100%", height: "100%" },
  discountBadge: {
    position: "absolute",
    left: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
  },
  discountText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    minHeight: 36,
  },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  priceTag: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  price: { color: colors.surface, fontWeight: "700", fontSize: 13 },
  original: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
    textDecorationLine: "line-through",
  },
});
