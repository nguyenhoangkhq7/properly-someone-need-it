// screens/SearchResultScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import SearchHeader from "../components/SearchHeader";
import FilterSortBar from "../components/FilterSortBar";
import ProductCard from "../components/ProductCard";
import colors from "../config/color";
import { productApi } from "../api/productApi";
import type { Item } from "../types/Item";
import { useUser } from "../context/UserContext";

const finalColors = {
  ...colors,
  background: colors.background || "#0A0A0A",
};

type ItemWithScore = Item & { similarity?: number; distanceKm?: number };

export default function SearchResultsScreen({ route, navigation }: any) {
  const { query, category } = route.params || {};
  const { user } = useUser();
  const userId = user?._id;

  const [searchText, setSearchText] = useState<string>(query || "");
  const [items, setItems] = useState<ItemWithScore[]>([]);
  const [filtered, setFiltered] = useState<ItemWithScore[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all"); // all | zeroPrice
  const [sortType, setSortType] = useState<string>("default"); // default | priceAsc | priceDesc | newest
  const [loading, setLoading] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const lastRequestedQuery = useRef<string>("");

  const fallbackCoords = { lat: 21.0285, lng: 105.8542 }; // Hanoi center

  const lazyRequire = (name: string) => {
    try {
      // eslint-disable-next-line no-eval
      const req = eval("require");
      return req(name);
    } catch (_e) {
      return null;
    }
  };

  const resolveLocation = async () => {
    const Location = lazyRequire("expo-location");
    if (!Location) return null;
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm || perm.status !== "granted") return null;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (_e) {
      return null;
    }
  };

  const fetchSemantic = async (text?: string) => {
    const currentQuery = (text ?? searchText).trim();
    lastRequestedQuery.current = currentQuery;
    setLoading(true);
    try {
      let data: ItemWithScore[] = [];
      if (currentQuery) {
        data = await productApi.search(currentQuery, userId, 50);
      } else {
        data = await productApi.getAll();
      }
      if (lastRequestedQuery.current === currentQuery) {
        setItems(data);
      }
    } catch (e) {
      console.warn("semantic search error", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemantic(query || "");
  }, [query]);

  useEffect(() => {
    if (!nearMe || coords) return;
    resolveLocation().then((loc) => {
      if (loc) setCoords(loc);
    });
  }, [nearMe, coords]);

  const filteredData = useMemo(() => {
    let data: ItemWithScore[] = [...items];
    const toRad = (d: number) => (d * Math.PI) / 180;
    const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };

    if (category) {
      data = data.filter((p) => p.category === category);
    }

    if (activeFilter === "zeroPrice") {
      data = data.filter((p) => p.price === 0);
    }

    if (nearMe) {
      const origin = coords || fallbackCoords;
      data = data
        .map((p) => {
          if (!p.location?.coordinates?.length) return null;
          const [lng, lat] = p.location.coordinates;
          const km = distanceKm(origin, { lat, lng });
          return { ...p, distanceKm: Math.round(km * 10) / 10 };
        })
        .filter((p) => p && p.distanceKm !== undefined && p.distanceKm <= 5) as ItemWithScore[];
    }

    if (sortType === "priceAsc") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortType === "priceDesc") {
      data.sort((a, b) => b.price - a.price);
    } else if (sortType === "newest") {
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return data;
  }, [items, category, activeFilter, sortType, nearMe, coords]);

  useEffect(() => {
    setFiltered(filteredData);
  }, [filteredData]);

  const handleSubmit = () => {
    fetchSemantic(searchText);
  };

  return (
    <View style={styles.fullScreenContainer}>
      <SearchHeader
        searchText={searchText}
        setSearchText={setSearchText}
        onBackPress={() => navigation.goBack()}
        onSubmit={handleSubmit}
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
        onRefresh={() => fetchSemantic(searchText)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: finalColors.background },
  listContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 12 },
});
