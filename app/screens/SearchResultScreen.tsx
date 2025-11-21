// screens/SearchResultScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import SearchHeader from "../components/SearchHeader";
import FilterSortBar from "../components/FilterSortBar";
import ProductCard from "../components/ProductCard";
import colors from "../config/color";
import { productApi } from "../api/productApi";
import type { Item } from "../types/Item";

const finalColors = {
  ...colors,
  background: colors.background || "#0A0A0A",
};

export default function SearchResultsScreen({ route, navigation }: any) {
  const { query, category } = route.params || {};

  const [searchText, setSearchText] = useState<string>(query || "");
  const [items, setItems] = useState<Item[]>([]);
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all"); // all | zeroPrice
  const [sortType, setSortType] = useState<string>("default"); // default | priceAsc | priceDesc | newest
  const [loading, setLoading] = useState(false);
  const [nearMe, setNearMe] = useState(false);

  const userLocation = { lat: 21.0285, lng: 105.8542 }; // placeholder: Hà Nội centro

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setItems(data);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let data = [...items];
    const toRad = (d: number) => (d * Math.PI) / 180;
    const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };

    if (searchText) {
      const kw = searchText.toLowerCase();
      data = data.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw)
      );
    }

    if (category) {
      data = data.filter((p) => p.category === category);
    }

    if (activeFilter === "zeroPrice") {
      data = data.filter((p) => p.price === 0);
    }

    if (nearMe) {
      data = data.filter((p) => {
        if (!p.location?.coordinates?.length) return false;
        const [lng, lat] = p.location.coordinates;
        return distanceKm(userLocation, { lat, lng }) <= 5;
      });
    }

    if (sortType === "priceAsc") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortType === "priceDesc") {
      data.sort((a, b) => b.price - a.price);
    } else if (sortType === "newest") {
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return data;
  }, [items, searchText, category, activeFilter, sortType]);

  useEffect(() => {
    setFiltered(filteredData);
  }, [filteredData]);

  return (
    <View style={styles.fullScreenContainer}>
      <SearchHeader
        searchText={searchText}
        setSearchText={setSearchText}
        onBackPress={() => navigation.goBack()}
        onSubmit={() => setFiltered(filteredData)}
      />

      <FilterSortBar
        totalResults={filtered.length}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortType={sortType}
        setSortType={setSortType}
        nearMe={nearMe}
        setNearMe={setNearMe}
      />

      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: finalColors.background },
  listContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 12 },
});
