import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import colors from "../config/color";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Banner from "../components/Banner";
import ProductList from "../components/ProductList";
import { productApi } from "../api/productApi";
import type { Item } from "../types/Item";
import { useUser } from "../context/UserContext";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const lazyRequire = (name: string) => {
  try {
    // Avoid Metro static resolution when module may be missing
    // eslint-disable-next-line no-eval
    const req = eval("require");
    return req(name);
  } catch (_e) {
    return null;
  }
};

type ItemWithDistance = Item & { distanceKm?: number };

const fallbackCoords = { lat: 21.0285, lng: 105.8542 }; // Hanoi center fallback
const haversineKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  return R * c;
};

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation<any>();
  const [nearbyItems, setNearbyItems] = useState<ItemWithDistance[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [forYouItems, setForYouItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const { user } = useUser();
  const userId = user?._id || "";

  const resolveLocation = async () => {
    const Location = lazyRequire("expo-location");
    if (!Location) return fallbackCoords;
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm || perm.status !== "granted") return fallbackCoords;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (_e) {
      return fallbackCoords;
    }
  };

  const fetchNearby = async () => {
    const loc = coords || (await resolveLocation()) || fallbackCoords;
    setCoords(loc);
    try {
      const data = await productApi.getNearBy(loc.lat, loc.lng, 5000);
      const withDistance: ItemWithDistance[] = data.slice(0, 5).map((item) => {
        const c = item.location?.coordinates;
        if (c && c.length >= 2) {
          const [lng, lat] = c;
          const km = haversineKm(loc, { lat, lng });
          return { ...item, distanceKm: Math.round(km * 10) / 10 };
        }
        return item;
      });
      setNearbyItems(withDistance);
    } catch (e) {
      console.warn("nearby error", e);
      setNearbyItems([]);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await productApi.getAll();
      setItems(data.slice(0, 5));
    } catch (e) {
      console.warn("items error", e);
      setItems([]);
    }
  };

  const fetchForYou = async () => {
    try {
      if (!userId) {
        const latest = await productApi.getNewItems();
        setForYouItems(latest.slice(0, 5));
        return;
      }

      const personalized = await productApi.getForYou(userId);
      if (!personalized || personalized.length === 0) {
        const latest = await productApi.getNewItems();
        setForYouItems(latest.slice(0, 5));
      } else {
        setForYouItems(personalized.slice(0, 5));
      }
    } catch (e) {
      console.warn("forYou error", e);
      try {
        const latest = await productApi.getNewItems();
        setForYouItems(latest.slice(0, 5));
      } catch (_e) {
        setForYouItems([]);
      }
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await delay(200);
      await Promise.all([fetchNearby(), fetchItems(), fetchForYou()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNearby();
    fetchItems();
  }, []);

  useEffect(() => {
    fetchForYou();
  }, [userId]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("SearchResults", { query: searchQuery });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Header />
      {refreshing && (
        <View style={styles.refreshBanner}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
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
            title="Danh cho ban"
            products={forYouItems.length ? forYouItems : items}
            horizontal={true}
            onSeeAll={() =>
              navigation.navigate("SearchResults", {
                query: "",
                from: "forYou",
                userId,
              })
            }
          />
          <ProductList
            title="Gan ban"
            products={nearbyItems}
            horizontal={true}
            onSeeAll={() =>
              navigation.navigate("SearchResults", {
                query: "",
                from: "nearYou",
                userId,
                coords,
              })
            }
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
  },
  refreshBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});

export default HomeScreen;
