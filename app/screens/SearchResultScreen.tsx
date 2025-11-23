import React, { useMemo, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components & Hooks
import SearchHeader from "../components/SearchHeader";
import FilterSortBar from "../components/FilterSortBar";
import ProductItem from "../components/ProductItem"; // Dùng component đã tối ưu Grid
import { useLocation } from "../hooks/useLocaltion";
import { useSearchData } from "../hooks/useSearchData"; // Hook vừa tạo ở trên
import { useAuth } from "../context/AuthContext";

// Utils & Config
import colors from "../config/color";
import { haversineKm, roundDistanceKm } from "../utils/distance";
import type { Item } from "../types/Item";
import type { ItemWithDistance } from "../types/Item"; // Type mở rộng { ...Item, distanceKm? }

const finalColors = {
  ...colors,
  background: colors.background || "#0A0A0A",
};

export default function SearchResultsScreen({ route, navigation }: any) {
  // 1. Params & Auth
  const { query, category, from, userId: routeUserId } = route.params || {};
  const { user } = useAuth();
  const userId = user?.id || routeUserId;

  // 2. Local State
  const [searchText, setSearchText] = useState<string>(query || "");
  const [activeFilter, setActiveFilter] = useState<string>("all"); // all | zeroPrice
  const [sortType, setSortType] = useState<string>("default");
  const [isNearMeActive, setIsNearMeActive] = useState(from === "nearYou");

  // 3. Hooks: Location & Data Fetching
  const { coords } = useLocation(); // Tự động lấy GPS hoặc User Address
  const { items, loading, refetch } = useSearchData({
    query: searchText,
    from,
    userId,
    coords,
  });

  // 4. LOGIC XỬ LÝ DỮ LIỆU TRUNG TÂM (useMemo)
  // Đây là nơi quan trọng nhất: Map Distance -> Filter -> Sort
  const processedData = useMemo(() => {
    let data: ItemWithDistance[] = [...items];

    // BƯỚC A: Tính khoảng cách cho TẤT CẢ item (nếu có coords)
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
    // 1. Theo Category (nếu có từ params)
    if (category) {
      data = data.filter((p) => p.category === category);
    }
    // 2. Theo FilterBar (Giá 0đ)
    if (activeFilter === "zeroPrice") {
      data = data.filter((p) => p.price === 0);
    }
    // 3. Theo "Gần tôi" (< 10km)
    if (isNearMeActive) {
      // Chỉ giữ lại item có distanceKm hợp lệ và < 10km (hoặc 5km tùy ý)
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
        // Nếu đang bật "Gần tôi", mặc định sort theo khoảng cách
        if (isNearMeActive) {
          data.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        }
        break;
    }

    return data;
  }, [items, coords, category, activeFilter, sortType, isNearMeActive]);

  // 5. Handlers
  const handleSubmit = () => {
    // Gọi refetch với từ khóa mới
    refetch(searchText);
  };

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
            {/* Dùng ProductItem đã tối ưu (đã có memo bên trong) */}
            <ProductItem product={item} horizontal={false} />
          </View>
        )}
        // Cấu hình Grid 2 cột
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        // Refresh Control
        refreshing={loading}
        onRefresh={() => refetch(searchText)}
        showsVerticalScrollIndicator={false}
        // Empty State
        ListEmptyComponent={
          loading ? null : (
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
    gap: 12, // Dùng gap thay vì marginHorizontal để căn đều
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
