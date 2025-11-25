import { useState, useCallback, useEffect } from "react";
import { productApi } from "../api/productApi";
import { haversineKm, roundDistanceKm } from "../utils/distance";
import type { Item, ItemWithDistance } from "../types/Item";

// ... (Giữ nguyên hàm addDistanceToItems) ...
const addDistanceToItems = (
  items: Item[],
  userCoords: { lat: number; lng: number } | null
): ItemWithDistance[] => {
  if (!items || !items.length) return [];
  if (!userCoords) return items;

  return items.map((item) => {
    const itemCoords = item.location?.coordinates;
    if (Array.isArray(itemCoords) && itemCoords.length === 2) {
      const [lng, lat] = itemCoords;
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const km = haversineKm(userCoords, { lat, lng });
        return { ...item, distanceKm: roundDistanceKm(km) };
      }
    }
    return item;
  });
};

export const useHomeData = (
  userId: string,
  coords: { lat: number; lng: number } | null,
  locationReady = true
) => {
  const [data, setData] = useState({
    nearby: [] as ItemWithDistance[],
    forYou: [] as ItemWithDistance[],
    newArrivals: [] as ItemWithDistance[],
    items: [] as ItemWithDistance[],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!locationReady) return;

    setLoading(true);

    // Helper: Hàm lọc sản phẩm của chính mình
    const filterOwnItems = (items: Item[]) => {
      if (!userId) return items; // Nếu chưa đăng nhập thì xem được hết
      // Giả sử item có trường sellerId. Nếu backend trả về object seller bên trong item, bạn sửa thành item.seller?._id
      return items.filter((item) => item.sellerId !== userId);
    };

    try {
      // --- Task 1: Dành cho bạn ---
      const fetchForYouTask = async (): Promise<Item[]> => {
        let res: Item[] = [];
        if (userId) {
          try {
            res = await productApi.getForYou(userId);
          } catch {}
        }

        if (!res?.length) {
          try {
            res = await productApi.getAll();
            res = res.sort(() => 0.5 - Math.random());
          } catch {}
        }

        // Lọc trước khi slice
        const filtered = filterOwnItems(res);
        return filtered.slice(0, 5);
      };

      // --- Task 2: Gần bạn ---
      const fetchNearbyTask = async (): Promise<Item[]> => {
        if (!coords) return [];
        try {
          const res = await productApi.getNearBy(coords.lat, coords.lng, 50000);

          // Lọc trước khi slice
          const filtered = filterOwnItems(res);
          return filtered.slice(0, 5);
        } catch {
          return [];
        }
      };

      // --- Task 3: Mới lên kệ ---
      const fetchNewArrivalsTask = async (): Promise<Item[]> => {
        try {
          const res = await productApi.getNewItems();
          const sorted = res.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

          // Lọc trước khi slice
          const filtered = filterOwnItems(sorted);
          return filtered.slice(0, 5);
        } catch {
          return [];
        }
      };

      // --- Task 4: Tất cả (Fallback chung) ---
      const fetchItemsTask = async (): Promise<Item[]> => {
        try {
          const res = await productApi.getAll();

          // Lọc trước khi slice
          const filtered = filterOwnItems(res);
          return filtered.slice(0, 10);
        } catch {
          return [];
        }
      };

      const [rawForYou, rawNearby, rawNewArrivals, rawItems] =
        await Promise.all([
          fetchForYouTask(),
          fetchNearbyTask(),
          fetchNewArrivalsTask(),
          fetchItemsTask(),
        ]);

      setData({
        forYou: addDistanceToItems(rawForYou, coords),
        nearby: addDistanceToItems(rawNearby, coords),
        newArrivals: addDistanceToItems(rawNewArrivals, coords),
        items: addDistanceToItems(rawItems, coords),
      });
    } catch (error) {
      console.error("Home data fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [userId, coords, locationReady]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, refresh: fetchData };
};
