import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import colors from "../config/color";

// Components
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Banner from "../components/Banner";
import ProductList from "../components/ProductList";

// Hooks & Context
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../hooks/useLocaltion";
import { useHomeData } from "../hooks/useHomeData";

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Logic trích xuất ID an toàn hơn
  const userId = user?.id || (user as any)?._id || "";

  // 1. Lấy vị trí
  const { coords, refreshLocation } = useLocation();

  // 2. Lấy dữ liệu (Dựa trên userId và coords)
  const {
    nearby,
    forYou,
    items,
    loading,
    refresh: refreshData,
  } = useHomeData(userId, coords);

  const onRefresh = async () => {
    // Refresh cả vị trí và dữ liệu
    await Promise.all([refreshLocation(), refreshData()]);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("SearchResults", { query: searchQuery });
    }
  };

  const handleSeeAll = (type: "forYou" | "nearYou") => {
    navigation.navigate("SearchResults", {
      query: "",
      from: type,
      userId,
      coords,
    });
  };

  // Logic hiển thị: Nếu không có forYou (lỗi hoặc rỗng hẳn) thì hiển thị items mới nhất
  const displayForYou = forYou.length > 0 ? forYou : items;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]} // Cho Android
          />
        }
      >
        <View style={styles.contentPadding}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchPress={handleSearch}
          />
          <Banner />

          <ProductList
            title="Dành cho bạn"
            products={displayForYou}
            horizontal={true}
            onSeeAll={() => handleSeeAll("forYou")}
          />

          <ProductList
            title="Gần bạn"
            products={nearby}
            horizontal={true}
            onSeeAll={() => handleSeeAll("nearYou")}
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
    paddingBottom: 50, // Thêm padding bottom để không bị che bởi tab bar (nếu có)
  },
});

export default HomeScreen;
