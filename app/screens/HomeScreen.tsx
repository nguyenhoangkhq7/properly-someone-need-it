import React, { useState, useCallback } from "react";
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
import AdBanner from "../components/AdBanner";
import ProductList from "../components/ProductList";

// Hooks & Context
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../hooks/useLocaltion";
import { useHomeData } from "../hooks/useHomeData";

const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const userId = user?.id || (user as any)?._id || "";
  const { coords, refreshLocation, loading: locationLoading } = useLocation();

  const {
    nearby,
    forYou,
    newArrivals,
    items,
    refresh: refreshData,
  } = useHomeData(userId, coords, !locationLoading);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await wait(100);
    try {
      await refreshLocation();
      await refreshData();
    } catch (error) {
      console.error("Lỗi khi refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshLocation, refreshData]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("SearchResults", { query: searchQuery });
    }
  };

  const handleSeeAll = (type: "forYou" | "nearYou" | "newArrivals") => {
    navigation.navigate("SearchResults", {
      query: "",
      from: type,
      userId,
      coords,
    });
  };

  const displayForYou = forYou.length > 0 ? forYou : items;

  // --- LẤY DỮ LIỆU TỪ ENV ---
  // Nếu không tìm thấy trong env, sẽ dùng link mặc định (fallback)
  const shopeeLink =
    process.env.EXPO_PUBLIC_ADS_SHOPEE_LINK || "https://shopee.vn";
  const bannerImage =
    process.env.EXPO_PUBLIC_ADS_BANNER_IMAGE || "https://placehold.co/600x200";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header chứa icon cái chuông, ta sẽ sửa file Header bên dưới */}
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollViewContent}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"white"}
            colors={["red"]}
            progressBackgroundColor={"yellow"}
            progressViewOffset={0}
          />
        }
      >
        <View style={styles.contentPadding}>
          {/* AdBanner sử dụng biến môi trường */}
          <AdBanner
            title="Siêu Sale Shopee"
            description="Giảm giá lên đến 50% cho đồ điện tử"
            image={bannerImage}
            cta="Mua Ngay"
            url={shopeeLink}
            onPress={() => console.log("User clicked banner")}
          />

          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchPress={handleSearch}
          />
          <Banner
            onPress={() =>
              navigation.navigate("SearchResults", {
                query: "",
                from: "search",
                userId,
                coords,
              })
            }
          />

          <ProductList
            title="Dành cho bạn"
            products={displayForYou}
            horizontal={true}
            onSeeAll={() => handleSeeAll("forYou")}
          />

          {newArrivals.length > 0 && (
            <ProductList
              title="Mới lên kệ"
              products={newArrivals}
              horizontal={true}
              onSeeAll={() => handleSeeAll("newArrivals")}
            />
          )}

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
    zIndex: 99,
    elevation: 1,
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 50,
  },
});

export default HomeScreen;
