import React, { useState } from "react";
import { ScrollView, StyleSheet, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Đảm bảo đã import
import colors from "../config/color"; // ✅ OK
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Banner from "../components/Banner";
import CategoryList from "../components/CategoryList";
import ProductList from "../components/ProductList";
import { categories } from "../data/categories";
import { featuredProducts, trendingProducts } from "../data/products";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* barStyle="light-content" là đúng cho nền tối, 
        backgroundColor cho StatusBar chỉ có tác dụng trên Android.
      */}
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header, SearchBar, Banner... cần được chỉnh style bên trong từng component */}
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollViewContent} // Áp dụng padding và background cho ScrollView
      >
        {/* Khoảng cách trên cùng cho nội dung ScrollView */}
        <View style={styles.contentPadding}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <Banner />
          <CategoryList categories={categories} />
          <ProductList
            title="Dành cho bạn"
            products={featuredProducts}
            horizontal={true} // <-- Thêm dòng này
          />

          {/* VÀ SỬA Ở ĐÂY */}
          <ProductList
            title="Đang bán chạy"
            products={trendingProducts}
            horizontal={true} // <-- Thêm dòng này
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, // Nền toàn bộ màn hình
  },
  scrollViewContent: {
    flex: 1, // Để ScrollView chiếm hết không gian còn lại
  },
  contentPadding: {
    paddingHorizontal: 16, // Padding hai bên cho toàn bộ nội dung trong ScrollView
    paddingVertical: 10, // Padding trên dưới cho nội dung
  },
});

export default HomeScreen;
