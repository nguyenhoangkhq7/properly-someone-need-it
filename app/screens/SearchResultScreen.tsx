import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchHeader from "../components/SearchHeader";
import FilterSortBar from "../components/FilterSortBar";
import ProductItem from "../components/ProductItem";
import { useLocation } from "../hooks/useLocaltion";
import { useSearchData } from "../hooks/useSearchData";
import { useAuth } from "../context/AuthContext";
import colors from "../config/color";

const finalColors = {
  ...colors,
  background: colors.background || "#0A0A0A",
};

export default function SearchResultsScreen({ route, navigation }: any) {
  const { query, category, from, userId: routeUserId } = route.params || {};
  const { user } = useAuth();
  const userId = user?.id || routeUserId;

  // UI States
  const [searchText, setSearchText] = useState<string>(query || "");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("default");
  const [isNearMeActive, setIsNearMeActive] = useState(from === "nearYou");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { coords } = useLocation();

  // Gọi Hook (Truyền tất cả State Filter/Sort vào đây)
  const {
    items, // Danh sách đã phân trang (để render FlatList)
    totalCount, // Tổng số lượng kết quả (để hiển thị Text)
    loading,
    isLoadingMore,
    isEnd,
    refetch,
    loadMore,
  } = useSearchData({
    query: searchText,
    from,
    userId,
    coords,
    // Truyền thêm các tham số này
    activeFilter,
    sortType,
    isNearMeActive,
    category,
  });

  const handleSubmit = () => refetch(searchText);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch(searchText);
    setIsRefreshing(false);
  }, [refetch, searchText]);

  // Footer Component
  const renderFooter = () => {
    if (items.length === 0 && !loading) return null;
    if (isLoadingMore) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    if (isEnd && items.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.endText}>Đã hiển thị tất cả sản phẩm</Text>
        </View>
      );
    }
    return <View style={{ height: 20 }} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <SearchHeader
        searchText={searchText}
        setSearchText={setSearchText}
        onBackPress={() => navigation.goBack()}
        onSubmit={handleSubmit}
      />

      {/* Truyền totalCount chính xác vào đây */}
      <FilterSortBar
        totalResults={totalCount}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortType={sortType}
        setSortType={setSortType}
        nearMe={isNearMeActive}
        setNearMe={setIsNearMeActive}
      />

      <FlatList
        data={items} // Dùng items trả về từ Hook
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <ProductItem product={item} horizontal={false} />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && !isLoadingMore && !isRefreshing && items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: finalColors.background },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  columnWrapper: { justifyContent: "space-between", gap: 12 },
  itemWrapper: { flex: 1, maxWidth: "48%" },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: colors.textSecondary || "#888", fontSize: 16 },
  footerContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  endText: {
    color: colors.textSecondary || "#888",
    fontSize: 14,
    fontStyle: "italic",
  },
});
