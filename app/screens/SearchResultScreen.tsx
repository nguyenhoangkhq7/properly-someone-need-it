import React, { useMemo, useState, useCallback } from "react"; // 1. Thêm useCallback
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl, // 2. Import RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components & Hooks
import SearchHeader from "../components/SearchHeader";
import FilterSortBar from "../components/FilterSortBar";
import ProductItem from "../components/ProductItem";
import { useLocation } from "../hooks/useLocaltion";
import { useSearchData } from "../hooks/useSearchData";
import { useAuth } from "../context/AuthContext";

// Utils & Config
import colors from "../config/color";
import { haversineKm, roundDistanceKm } from "../utils/distance";
import type { Item } from "../types/Item";
import type { ItemWithDistance } from "../types/Item";

const finalColors = {
  ...colors,
  background: colors.background || "#0A0A0A",
};

// 3. Hàm wait tạo delay
const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

export default function SearchResultsScreen({ route, navigation }: any) {
  // 1. Params & Auth
  const { query, category, from, userId: routeUserId } = route.params || {};
  const { user } = useAuth();
  const userId = user?.id || routeUserId;

  // 2. Local State
  const [searchText, setSearchText] = useState<string>(query || "");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("default");
  const [isNearMeActive, setIsNearMeActive] = useState(from === "nearYou");

  // State riêng cho UI refresh (pull-to-refresh)
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. Hooks: Location & Data Fetching
  const { coords } = useLocation();
  const { items, loading, refetch } = useSearchData({
    query: searchText,
    from,
    userId,
    coords,
  });

  // 4. LOGIC XỬ LÝ DỮ LIỆU (Giữ nguyên)
  const processedData = useMemo(() => {
    let data: ItemWithDistance[] = [...items];

    // ... (Giữ nguyên logic tính toán khoảng cách và filter của bạn) ...
    // BƯỚC A: Tính khoảng cách
    if (coords) {
      data = data.map((item) => {
        const itemCoords = item.location?.coordinates;
        if (Array.isArray(itemCoords) && itemCoords.length === 2) {
          const [lng, lat] = itemCoords;
          const km = haversineKm(coords, { lat, lng });
          return { ...item, distanceKm: roundDistanceKm(km) };
        }
        return item;
      });
    }

    // BƯỚC B: Filter
    if (category) data = data.filter((p) => p.category === category);
    if (activeFilter === "zeroPrice") data = data.filter((p) => p.price === 0);
    if (isNearMeActive) {
      data = data.filter(
        (p) => typeof p.distanceKm === "number" && p.distanceKm <= 10
      );
    }

    // BƯỚC C: Sort
    switch (sortType) {
      case "priceAsc":
        data.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        data.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "default":
      default:
        if (isNearMeActive) {
          data.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        }
        break;
    }

    return data;
  }, [items, coords, category, activeFilter, sortType, isNearMeActive]);

  // 5. Handlers
  const handleSubmit = () => {
    refetch(searchText);
  };

  // --- HÀM REFRESH MỚI ---
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true); // Hiện icon xoay

    // Delay 100ms để người dùng kịp nhìn thấy hiệu ứng
    await wait(100);

    try {
      // Gọi hàm refetch dữ liệu
      await refetch(searchText);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false); // Ẩn icon xoay
    }
  }, [refetch, searchText]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <SearchHeader
        searchText={searchText}
        setSearchText={setSearchText}
        onBackPress={() => navigation.goBack()}
        onSubmit={handleSubmit}
      />

      <FilterSortBar
        totalResults={processedData.length}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortType={sortType}
        setSortType={setSortType}
        nearMe={isNearMeActive}
        setNearMe={setIsNearMeActive}
      />

      <FlatList
        data={processedData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <ProductItem product={item} horizontal={false} />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        // --- CẤU HÌNH REFRESH CONTROL ---
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            // iOS
            tintColor={"white"}
            title="Đang tải lại..."
            titleColor={"white"}
            // Android
            colors={[colors.text, "red"]}
            progressBackgroundColor={"white"}
            progressViewOffset={10}
          />
        }
        showsVerticalScrollIndicator={false}
        // Empty State
        ListEmptyComponent={
          loading && !isRefreshing ? null : ( // Chỉ hiện empty khi không loading và không refreshing
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Không tìm thấy sản phẩm nào phù hợp.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: finalColors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
    gap: 12,
  },
  itemWrapper: {
    flex: 1,
    maxWidth: "48%",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
