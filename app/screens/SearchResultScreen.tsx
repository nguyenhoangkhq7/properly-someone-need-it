// screens/SearchResultScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import SearchHeader from "../components/SearchHeader";
import FilterSortBar from "../components/FilterSortBar";
import ProductCard from "../components/ProductCard";
import colors from "../config/color";
import { productApi } from "../api/productApi";
import type { Item } from "../types/Item";
import { useAuth } from "../context/AuthContext";
import {
  getUserLatLng,
  haversineKm,
  roundDistanceKm,
  type LatLng,
} from "../utils/distance";

const finalColors = {
  ...colors,
  background: colors.background || "#0A0A0A",
};

type ItemWithScore = Item & { similarity?: number; distanceKm?: number };

export default function SearchResultsScreen({ route, navigation }: any) {
  const {
    query,
    category,
    from,
    userId: routeUserId,
    coords: initialCoords,
  } = route.params || {};
  const { user } = useAuth();
  const userId =
    user?.id ||
    (user as { _id?: string } | null | undefined)?._id ||
    routeUserId;
  const userCoords = getUserLatLng(user);

  const [searchText, setSearchText] = useState<string>(query || "");
  const [items, setItems] = useState<ItemWithScore[]>([]);
  const [filtered, setFiltered] = useState<ItemWithScore[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all"); // all | zeroPrice
  const [sortType, setSortType] = useState<string>("default"); // default | priceAsc | priceDesc | newest
  const [loading, setLoading] = useState(false);
  const [nearMe, setNearMe] = useState(from === "nearYou");
  const [coords, setCoords] = useState<LatLng | null>(
    initialCoords || userCoords || null
  );
  const lastRequestedQuery = useRef<string>("");
  const userCoordKey = userCoords ? `${userCoords.lat},${userCoords.lng}` : "";

  useEffect(() => {
    if (!userCoords) return;
    setCoords((prev) => {
      if (!prev) return userCoords;
      const sameLat = Math.abs(prev.lat - userCoords.lat) < 1e-6;
      const sameLng = Math.abs(prev.lng - userCoords.lng) < 1e-6;
      return sameLat && sameLng ? prev : userCoords;
    });
  }, [userCoordKey]);

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

  const fetchNearBy = async () => {
    setLoading(true);
    try {
      const origin =
        userCoords ||
        coords ||
        (await resolveLocation()) ||
        fallbackCoords;
      setCoords((prev) => (userCoords ? userCoords : prev ?? origin));
      const data = await productApi.getNearBy(origin.lat, origin.lng, 5000);
      setItems(data);
      setNearMe(true);
    } catch (e) {
      console.warn("nearby search error", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchForYouList = async () => {
    setLoading(true);
    try {
      if (userId) {
        const personalized = await productApi.getForYou(userId);
        if (personalized && personalized.length) {
          setItems(personalized);
          return;
        }
      }
      const latest = await productApi.getNewItems();
      setItems(latest);
    } catch (e) {
      console.warn("forYou search error", e);
      setItems([]);
    } finally {
      setLoading(false);
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
    setSearchText(query || "");
    setActiveFilter("all");
    setSortType("default");

    if (from === "nearYou") {
      setNearMe(true);
      fetchNearBy();
      return;
    }

    if (from === "forYou") {
      setNearMe(false);
      fetchForYouList();
      return;
    }

    setNearMe(false);
    fetchSemantic(query || "");
  }, [from, query, userId]);

  useEffect(() => {
    if (!nearMe || coords || userCoords) return;
    resolveLocation().then((loc) => {
      if (loc) setCoords(loc);
    });
  }, [nearMe, coords, userCoordKey]);

  const filteredData = useMemo(() => {
    let data: ItemWithScore[] = [...items];

    if (category) {
      data = data.filter((p) => p.category === category);
    }

    if (activeFilter === "zeroPrice") {
      data = data.filter((p) => p.price === 0);
    }

    if (nearMe) {
      const origin = userCoords || coords || fallbackCoords;
      data = data
        .map((p) => {
          if (!p.location?.coordinates?.length) return null;
          const [lng, lat] = p.location.coordinates;
          const km = haversineKm(origin, { lat, lng });
          return { ...p, distanceKm: roundDistanceKm(km) };
        })
        .filter((p) => p && p.distanceKm !== undefined && p.distanceKm <= 5) as ItemWithScore[];

      if (sortType === "default") {
        data.sort(
          (a, b) =>
            (a.distanceKm ?? Number.POSITIVE_INFINITY) -
            (b.distanceKm ?? Number.POSITIVE_INFINITY)
        );
      }
    }

    if (sortType === "priceAsc") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortType === "priceDesc") {
      data.sort((a, b) => b.price - a.price);
    } else if (sortType === "newest") {
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return data;
  }, [items, category, activeFilter, sortType, nearMe, coords, userCoordKey]);

  useEffect(() => {
    setFiltered(filteredData);
  }, [filteredData]);

  const handleSubmit = () => {
    fetchSemantic(searchText);
  };

  const handleRefresh = () => {
    if (searchText.trim()) {
      return fetchSemantic(searchText);
    }
    if (from === "nearYou") return fetchNearBy();
    if (from === "forYou") return fetchForYouList();
    return fetchSemantic(searchText);
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
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: finalColors.background },
  listContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 12 },
});
