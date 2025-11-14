// File: screens/SearchResultsScreen.tsx
import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
// ✅ IMPORT DỮ LIỆU TỪ ĐƯỜNG DẪN CỦA BẠN
import { featuredProducts, Product } from "../data/products";

// Import các component
import SearchHeader from "../components/SearchHeader";
import FilterSortBar from "../components/FilterSortBar";
import ProductCard from "../components/ProductCard";
import colors from "../config/color";

const { width } = Dimensions.get("window");

const finalColors = {
  ...colors,
  background: colors.background || "#0A0A0A",
};

// Hàm chuyển đổi giá trị string sang số để sắp xếp
const parsePrice = (priceString: string): number => {
  // Chuyển "X.XXX.XXX ₫" thành số (ví dụ: "15.000.000 ₫" -> 15000000)
  return parseInt(priceString.replace(/\./g, "").replace(" ₫", ""));
};

export default function SearchResultsScreen({ route, navigation }: any) {
  const { query, category } = route.params || {}; // 👈 thêm category

  // Nếu có query thì dùng query, còn không thì dùng category
  const initialSearch = query || category || "";

  const [searchText, setSearchText] = useState(initialSearch);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    featuredProducts as Product[]
  );
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("default");

  useEffect(() => {
    let data = featuredProducts as Product[];

    // ✅ Lọc theo từ khóa hoặc danh mục
    if (searchText) {
      data = data.filter((p) =>
        p.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // ✅ Lọc theo bộ lọc
    if (activeFilter === "freeShip") {
      // data = data.filter((p) => p.freeShip);
    }

    // ✅ Sắp xếp
    const sortedData = [...data];
    if (sortType === "priceAsc") {
      sortedData.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortType === "priceDesc") {
      sortedData.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    setFilteredProducts(sortedData);
  }, [searchText, activeFilter, sortType]);

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard item={item} />
  );

  return (
    <View style={styles.fullScreenContainer}>
      <SearchHeader
        searchText={searchText}
        setSearchText={setSearchText}
        onBackPress={() => navigation.goBack()}
      />

      <FilterSortBar
        totalResults={filteredProducts.length}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortType={sortType}
        setSortType={setSortType}
      />

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: finalColors.background },
  listContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 12 },
});
