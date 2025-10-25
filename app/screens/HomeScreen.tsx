import React, { useState } from "react";
import { ScrollView, StyleSheet, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import colors from "../config/color";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Banner from "../components/Banner";
import CategoryList from "../components/CategoryList";
import ProductList from "../components/ProductList";
import { categories } from "../data/categories";
import { featuredProducts, trendingProducts } from "../data/products";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation<any>();

  // ✅ HÀM XỬ LÝ ĐIỀU HƯỚNG TÌM KIẾM
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Điều hướng đến màn hình SearchResults và truyền query đi
      // Đảm bảo tên màn hình "SearchResults" khớp với tên trong navigator
      navigation.navigate("SearchResults", { query: searchQuery });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollViewContent}
      >
        <View style={styles.contentPadding}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchPress={handleSearch} // ✅ TRUYỀN HÀM XỬ LÝ
          />
          <Banner />
          <CategoryList categories={categories} />

          <ProductList
            title="Dành cho bạn"
            products={featuredProducts}
            horizontal={true}
          />
          <ProductList
            title="Đang bán chạy"
            products={trendingProducts}
            horizontal={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewContent: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});

export default HomeScreen;
