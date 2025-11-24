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
      // Validate toạ độ hợp lệ
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
    // Chỉ fetch khi location đã xử lý xong (dù là có toạ độ hay fallback)
    if (!locationReady) return;

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
        // FIX: Fallback về getAll (lấy ngẫu nhiên hoặc theo danh mục)
        // thay vì getNewItems để tránh trùng với mục "Mới lên kệ"
        if (!res?.length) {
          try {
            res = await productApi.getAll();
            // Mẹo nhỏ: Xáo trộn mảng để tạo cảm giác mới mẻ (shuffle)
            res = res.sort(() => 0.5 - Math.random());
          } catch {}
        }
        return res ? res.slice(0, 5) : [];
      };

      // --- Task 2: Gần bạn ---
      const fetchNearbyTask = async (): Promise<Item[]> => {
        if (!coords) return [];
        try {
          // Tăng bán kính hoặc xử lý logic nếu user dùng Fallback Coords (Hà Nội)
          // Nếu coords == Fallback và user không ở đó, mục này có thể sai.
          // Tạm thời giữ nguyên logic gọi API
          const res = await productApi.getNearBy(coords.lat, coords.lng, 50000); // Tăng lên 50km
          return res.slice(0, 5);
        } catch {
          return [];
        }
      };

      // --- Task 3: Mới lên kệ ---
      const fetchNewArrivalsTask = async (): Promise<Item[]> => {
        try {
          const res = await productApi.getNewItems();

          // FIX: Bỏ logic lọc cứng 7 ngày (sevenDaysAgo).
          // Lý do: Nếu shop không post gì 7 ngày qua, app sẽ trống trơn.
          // Thay vào đó: Chỉ cần sort theo ngày tạo mới nhất là đủ.
          const sorted = res.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Mới nhất lên đầu
          });

          return sorted.slice(0, 5);
        } catch {
          return [];
        }
      };

      // --- Task 4: Tất cả (Fallback chung) ---
      const fetchItemsTask = async (): Promise<Item[]> => {
        try {
          const res = await productApi.getAll();
          return res.slice(0, 10); // Lấy nhiều hơn chút để user lướt
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

      // Tính lại khoảng cách cho tất cả item dựa trên coords mới nhất
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
  }, [userId, coords, locationReady]); // Bỏ coords.lat/lng, dùng object coords để React so sánh reference

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, refresh: fetchData };
};
