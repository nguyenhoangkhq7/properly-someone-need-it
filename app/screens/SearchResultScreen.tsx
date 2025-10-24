// File: screens/SearchResultsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
// ✅ IMPORT DỮ LIỆU TỪ ĐƯỜNG DẪN CỦA BẠN
import { featuredProducts } from "../data/products"; 

// Import các component
import SearchHeader from "../components/SearchHeader";
import FilterSortBar from "../components/FilterSortBar";
import ProductCard from "../components/ProductCard"; 
import colors from "../config/color";

const { width } = Dimensions.get("window");

// Cấu trúc Product MỚI theo file products.ts
interface Product {
    id: string;
    title: string;
    image: string;
    price: string; 
    originalPrice?: string;
    discount?: string; 
}

const finalColors = {
    ...colors,
    background: colors.background || "#0A0A0A",
};

// Hàm chuyển đổi giá trị string sang số để sắp xếp
const parsePrice = (priceString: string): number => {
    // Chuyển "X.XXX.XXX ₫" thành số (ví dụ: "15.000.000 ₫" -> 15000000)
    return parseInt(priceString.replace(/\./g, '').replace(' ₫', ''));
};


export default function SearchResultsScreen({ route, navigation }: any) {
  const { query } = route.params;
  const [searchText, setSearchText] = useState(query || "");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(featuredProducts as Product[]); // Khởi tạo bằng dữ liệu import
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("default");

  useEffect(() => {
    // Lấy dữ liệu từ file import
    let data = featuredProducts as Product[]; 
    
    // 1. Lọc theo từ khóa
    data = data.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    // 2. Lọc theo filter (ví dụ: freeShip)
    if (activeFilter === "freeShip") {
        // Giả sử dữ liệu trong file products.ts có trường freeShip
        // data = data.filter((p) => p.freeShip);
    } 
    
    // 3. Sắp xếp
    const sortedData = [...data];
    if (sortType === 'priceAsc') {
        sortedData.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortType === 'priceDesc') {
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
        // Sử dụng tổng số sản phẩm trong file gốc để hiển thị
        totalResults={featuredProducts.length} 
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