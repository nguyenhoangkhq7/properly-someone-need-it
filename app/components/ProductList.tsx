// components/ProductList.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import colors from "../config/color";
import { Product } from "../data/products";

interface Props {
  title: string;
  products: Product[];
  horizontal?: boolean; // keep option
}

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2; // padding + margin

const ProductList: React.FC<Props> = ({
  title,
  products,
  horizontal = false,
}) => {
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.card, { width: horizontal ? 150 : cardWidth }]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
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
        <View style={styles.priceTag}>
          <Text style={styles.price}>{item.price}</Text>
        </View>
        {item.originalPrice && (
          <Text style={styles.original}>{item.originalPrice}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.seeAll}>Xem tất cả</Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(i) => i.id}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        numColumns={horizontal ? 1 : 2}
        contentContainerStyle={horizontal ? styles.hList : styles.vList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  seeAll: { color: colors.neonSoft, fontSize: 13 },

  // list
  hList: { paddingLeft: 12, paddingRight: 8 },
  vList: { paddingHorizontal: 12 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 6,
    marginBottom: 12,
    overflow: "hidden",
    // shadow
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

export default ProductList;
