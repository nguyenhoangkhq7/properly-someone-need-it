import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../config/color";
import type { Item } from "../types/Item";
import ProductItem from "./ProductItem";

interface Props {
  title: string;
  products: Array<Item & { distanceKm?: number }>;
  horizontal?: boolean;
  onSeeAll?: () => void;
}

const ProductList: React.FC<Props> = ({
  title,
  products,
  horizontal = false,
  onSeeAll,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onSeeAll} disabled={!onSeeAll}>
          <Text style={[styles.seeAll, !onSeeAll && styles.disabledText]}>
            Xem tất cả
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductItem product={item} horizontal={horizontal} />
        )}
        keyExtractor={(item) => item._id}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        numColumns={horizontal ? 1 : 2}
        columnWrapperStyle={horizontal ? undefined : styles.columnWrapper}
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

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },

  seeAll: {
    color: colors.neonSoft,
    fontSize: 14,
  },
  disabledText: { opacity: 0.4 },

  hList: {
    paddingLeft: 12,
    paddingRight: 8,
  },

  vList: {
    paddingHorizontal: 12,
  },

  columnWrapper: {
    justifyContent: "space-between",
  },
});

export default ProductList;
