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

// Hàm tạo delay (đơn vị mili giây)
const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");

  // State quản lý trạng thái refresh
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

  // --- LOGIC REFRESH TÙY CHỈNH ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true); // 1. Bắt đầu hiển thị vòng xoay ngay lập tức

    // 2. Delay 100ms (theo yêu cầu) để tạo cảm giác "đang xử lý"
    await wait(100);

    try {
      // 3. Gọi API nạp lại dữ liệu
      // Promise.all giúp chạy song song cả location và data sản phẩm
      await refreshLocation();
      await refreshData();
    } catch (error) {
      console.error("Lỗi khi refresh:", error);
    } finally {
      // 4. Tắt vòng xoay sau khi mọi thứ hoàn tất
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

  // Link tiếp thị liên kết (Affiliate) hoặc link Shop của bạn
  const shopeeLink =
    "https://l.facebook.com/l.php?u=https%3A%2F%2Fvn.shp.ee%2Fm5yMrCw%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbVhGdkNJS3NqaUJoVEo3THNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7mWWTHIahpg8sOLpcONUuihKWeEBLGjwqG2qKH5XDXKxsNka_XQ2eWbDbW5g_aem_iCPgy9JxoxYuavm-nMQyKA&h=AT1vkPyUaRHUV3lHv1UUNYqhjLEBpVCCwZ6aYYP9uVk-lb7BFYOvgj-OMiVEzmMEJeuVgm6OsNWOuqFePcmgUzz3r_vg-s3i-T41d-hietvlq_gEki3mvUb5rof2zfB9LigT_i5NApxqZLTGBhwj-da0ZUZDV_lc&__tn__=-UK-R&c[0]=AT3bgmMqh627E68wlN8cohhHhCKxZFARHnVNbgW-m0G69E24dA7-kg9IBVhWZCANgyoh3mRPHQGz13azyQNrlbZINwZe3FMbCiw-YCqLarkwxKnHxWM1ma5ZMfPqTcmvTgSQWuR2YsOSBTOPQW9UgI2P1h18iRyrR0naGyblwh2mVIe26742nJivDg33Aq2nt_KPP_U_G4Ns0MpBfegMe0X9rUEmwxk";

  // Ảnh banner Shopee (bạn nên dùng ảnh có tỉ lệ ngang)
  const bannerImage =
    "https://cdnmedia.baotintuc.vn/Upload/cVJiASFv9S8nriO7eNwA/files/2021/11/2-11/2021_Shopee1111_KV.png";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollViewContent}
        contentContainerStyle={{ flexGrow: 1 }}
        // reload
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            // --- 1. CẤU HÌNH CHO IOS (Nền đen, icon trắng) ---
            tintColor={"white"}
            // --- 2. CẤU HÌNH CHO ANDROID (Test màu nổi) ---
            // Mũi tên màu ĐỎ
            colors={["red"]}
            // Nền tròn màu VÀNG
            progressBackgroundColor={"yellow"}
            // --- 3. VỊ TRÍ (QUAN TRỌNG) ---
            // Hãy đưa về 0 hoặc số nhỏ. Vì ScrollView của bạn bắt đầu NGAY DƯỚI Header
            // nên không cần đẩy xuống quá sâu.
            progressViewOffset={0}
          />
        }
      >
        <View style={styles.contentPadding}>
          <AdBanner
            title="Siêu Sale Shopee"
            description="Giảm giá lên đến 50% cho đồ điện tử"
            image={bannerImage}
            cta="Mua Ngay"
            url={shopeeLink} // Truyền link vào đây
            onPress={() => console.log("User clicked banner")} // Optional: dùng để log analytics
          />
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchPress={handleSearch}
          />
          <Banner />

          {/* Dành cho bạn */}
          <ProductList
            title="Dành cho bạn"
            products={displayForYou}
            horizontal={true}
            onSeeAll={() => handleSeeAll("forYou")}
          />

          {/* Mới lên kệ */}
          {newArrivals.length > 0 && (
            <ProductList
              title="Mới lên kệ"
              products={newArrivals}
              horizontal={true}
              onSeeAll={() => handleSeeAll("newArrivals")}
            />
          )}

          {/* Gần bạn */}
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
    zIndex: 99, // <--- Thêm dòng này
    elevation: 1, // <--- Thêm dòng này cho Android
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 50,
  },
});

export default HomeScreen;
