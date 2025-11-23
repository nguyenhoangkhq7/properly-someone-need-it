import { useState, useCallback, useEffect } from "react";
import { productApi } from "../api/productApi";
import { haversineKm, roundDistanceKm } from "../utils/distance";
import type { Item } from "../types/Item";
import type { ItemWithDistance } from "../types/Item";

// Hàm tiện ích: Nhận vào danh sách Item -> Trả về danh sách có distanceKm
const addDistanceToItems = (
  items: Item[],
  userCoords: { lat: number; lng: number } | null
): ItemWithDistance[] => {
  if (!items || !items.length) return [];
  // Nếu chưa có tọa độ user, trả về item gốc (distanceKm = undefined)
  if (!userCoords) return items;

  return items.map((item) => {
    const itemCoords = item.location?.coordinates;

    // VALIDATE KỸ: MongoDB GeoJSON lưu là [LONGITUDE, LATITUDE]
    if (Array.isArray(itemCoords) && itemCoords.length === 2) {
      const [lng, lat] = itemCoords; // Lấy đúng thứ tự

      // Kiểm tra tọa độ hợp lệ (Lat: -90 đến 90, Lng: -180 đến 180)
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        // Tính khoảng cách từ User -> Item
        const km = haversineKm(userCoords, { lat, lng });
        return { ...item, distanceKm: roundDistanceKm(km) };
      }
    }
    return item;
  });
};

export const useHomeData = (
  userId: string,
  coords: { lat: number; lng: number } | null
) => {
  const [data, setData] = useState({
    nearby: [] as ItemWithDistance[],
    forYou: [] as ItemWithDistance[], // Cập nhật Type: có distance
    items: [] as ItemWithDistance[], // Cập nhật Type: có distance
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Định nghĩa các task gọi API
      const fetchForYouTask = async (): Promise<Item[]> => {
        let res: Item[] = [];
        if (userId) {
          try {
            res = await productApi.getForYou(userId);
          } catch {}
        }
        if (!res?.length) {
          try {
            res = await productApi.getNewItems();
          } catch {}
        }
        return res ? res.slice(0, 5) : [];
      };

      const fetchNearbyTask = async (): Promise<Item[]> => {
        if (!coords) return [];
        try {
          // Lưu ý: API getNearBy thường đã sort theo khoảng cách,
          // nhưng ta vẫn cần tính lại km để hiển thị
          const res = await productApi.getNearBy(coords.lat, coords.lng, 5000);
          return res.slice(0, 5);
        } catch {
          return [];
        }
      };

      const fetchItemsTask = async (): Promise<Item[]> => {
        try {
          const res = await productApi.getAll();
          return res.slice(0, 5);
        } catch {
          return [];
        }
      };

      // 2. Chạy song song
      const [rawForYou, rawNearby, rawItems] = await Promise.all([
        fetchForYouTask(),
        fetchNearbyTask(),
        fetchItemsTask(),
      ]);

      // 3. Tính toán khoảng cách cho TẤT CẢ các danh sách
      // Lúc này coords có thể null, hàm addDistanceToItems sẽ tự xử lý
      const forYou = addDistanceToItems(rawForYou, coords);
      const nearby = addDistanceToItems(rawNearby, coords);
      const items = addDistanceToItems(rawItems, coords);

      setData({ forYou, nearby, items });
    } catch (error) {
      console.error("Home data fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [userId, coords?.lat, coords?.lng]);
  // Dependency quan trọng: Khi coords thay đổi, logic này chạy lại và tính lại khoảng cách

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, refresh: fetchData };
};
