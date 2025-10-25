import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import colors from "../config/color";
import { Product } from "../data/products";
import ProductItem from "./ProductItem";

interface Props {
  title: string;
  products: Product[];
  horizontal?: boolean;
}

const ProductList: React.FC<Props> = ({ title, products, horizontal = false }) => {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.seeAll}>Xem tất cả</Text>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => <ProductItem product={item} horizontal={horizontal} />}
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
  hList: { paddingLeft: 12, paddingRight: 8 },
  vList: { paddingHorizontal: 12 },
});

export default ProductList;
