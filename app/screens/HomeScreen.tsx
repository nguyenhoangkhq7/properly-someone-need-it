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
  const userId = user?.id || (user as any)?._id || "";
  const { coords, refreshLocation } = useLocation();

  // 1. Destructuring thêm newArrivals
  const {
    nearby,
    forYou,
    newArrivals, // <--- Dữ liệu mới
    items,
    loading,
    refresh: refreshData,
  } = useHomeData(userId, coords);

  const onRefresh = async () => {
    await Promise.all([refreshLocation(), refreshData()]);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("SearchResults", { query: searchQuery });
    }
  };

  // 2. Cập nhật type cho hàm handleSeeAll
  const handleSeeAll = (type: "forYou" | "nearYou" | "newArrivals") => {
    navigation.navigate("SearchResults", {
      query: "",
      from: type,
      userId,
      coords,
    });
  };

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
            colors={[colors.primary]}
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

          {/* Mục 1: Dành cho bạn */}
          <ProductList
            title="Dành cho bạn"
            products={displayForYou}
            horizontal={true}
            onSeeAll={() => handleSeeAll("forYou")}
          />

          {/* Mục 2: MỚI NHẤT (7 ngày qua) - Thêm vào đây */}
          {newArrivals.length > 0 && (
            <ProductList
              title="Mới lên kệ"
              products={newArrivals}
              horizontal={true}
              onSeeAll={() => handleSeeAll("newArrivals")}
            />
          )}

          {/* Mục 3: Gần bạn */}
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
