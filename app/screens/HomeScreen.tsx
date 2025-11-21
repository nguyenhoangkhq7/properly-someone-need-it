import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import colors from "../config/color";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Banner from "../components/Banner";
import ProductList from "../components/ProductList";
import { productApi } from "../api/productApi";
import type { Item } from "../types/Item";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation<any>();
  const [nearbyItems, setNearbyItems] = useState<Item[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await productApi.getAll();
        setNearbyItems(data.slice(0, 5));
      } catch (e) {
        console.warn("error", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const data = await productApi.getAll();
      setItems(data.slice(0, 5));
    })();
  }, []);

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
          <ProductList
            title="Dành cho bạn"
            products={items}
            horizontal={true}
            onSeeAll={() =>
              navigation.navigate("SearchResults", {
                query: "",
                from: "forYou",
              })
            }
          />
          <ProductList
            title="Gần bạn"
            products={nearbyItems}
            horizontal={true}
            onSeeAll={() =>
              navigation.navigate("SearchResults", {
                query: "",
                from: "nearYou",
              })
            }
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
