import { useState, useCallback, useEffect } from "react";
import { productApi } from "../api/productApi";
import { haversineKm, roundDistanceKm } from "../utils/distance";
import type { Item } from "../types/Item";
import type { ItemWithDistance } from "../types/Item";

// ... (Giữ nguyên hàm addDistanceToItems như cũ) ...
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
    newArrivals: [] as ItemWithDistance[], // <--- THÊM MỚI
    items: [] as ItemWithDistance[],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!locationReady) {
      return;
    }

    setLoading(true);

    try {
      // --- Task 1: Dành cho bạn ---
      const fetchForYouTask = async (): Promise<Item[]> => {
        let res: Item[] = [];
        if (userId) {
          try {
            res = await productApi.getForYou(userId);
          } catch {}
        }
        // Fallback nếu không có gợi ý
        if (!res?.length) {
          try {
            res = await productApi.getNewItems();
          } catch {}
        }
        return res ? res.slice(0, 5) : [];
      };

      // --- Task 2: Gần bạn ---
      const fetchNearbyTask = async (): Promise<Item[]> => {
        if (!coords) return [];
        try {
          const res = await productApi.getNearBy(coords.lat, coords.lng, 5000);
          return res.slice(0, 5);
        } catch {
          return [];
        }
      };

      // --- Task 3: Mới nhất (7 ngày qua) ---
      const fetchNewArrivalsTask = async (): Promise<Item[]> => {
        try {
          // Gọi API lấy danh sách sản phẩm mới (giả sử lấy 20 item để lọc)
          const res = await productApi.getNewItems();

          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          // Logic lọc và sắp xếp
          const filtered = res.filter((item) => {
            // Đảm bảo item có createdAt
            if (!item.createdAt) return false;
            const itemDate = new Date(item.createdAt);
            return itemDate >= sevenDaysAgo;
          });

          // Sắp xếp: Mới nhất lên đầu (Descending)
          filtered.sort((a, b) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          return filtered.slice(0, 5); // Lấy top 5 hiển thị home
        } catch {
          return [];
        }
      };

      // --- Task 4: Tất cả (để fallback) ---
      const fetchItemsTask = async (): Promise<Item[]> => {
        try {
          const res = await productApi.getAll();
          return res.slice(0, 5);
        } catch {
          return [];
        }
      };

      // Chạy song song 4 task
      const [rawForYou, rawNearby, rawNewArrivals, rawItems] =
        await Promise.all([
          fetchForYouTask(),
          fetchNearbyTask(),
          fetchNewArrivalsTask(),
          fetchItemsTask(),
        ]);

      // Tính khoảng cách cho TẤT CẢ
      const forYou = addDistanceToItems(rawForYou, coords);
      const nearby = addDistanceToItems(rawNearby, coords);
      const newArrivals = addDistanceToItems(rawNewArrivals, coords); // <--- Xử lý distance
      const items = addDistanceToItems(rawItems, coords);

      setData({ forYou, nearby, newArrivals, items });
    } catch (error) {
      console.error("Home data fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [userId, coords?.lat, coords?.lng, locationReady]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, refresh: fetchData };
};
