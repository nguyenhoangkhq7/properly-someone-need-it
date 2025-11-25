import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { productApi } from "../api/productApi";
import type { Item, ItemWithDistance } from "../types/Item";
import { haversineKm, roundDistanceKm } from "../utils/distance";

type SearchParams = {
  query?: string;
  from?: "nearYou" | "forYou" | "search";
  userId?: string;
  coords?: { lat: number; lng: number } | null;
  // Thêm các tham số Filter/Sort vào Hook
  activeFilter: string;
  sortType: string;
  isNearMeActive: boolean;
  category?: string;
};

const PAGE_SIZE = 15;

export const useSearchData = ({
  query: initialQuery,
  from,
  userId,
  coords,
  activeFilter,
  sortType,
  isNearMeActive,
  category,
}: SearchParams) => {
  // Dữ liệu gốc từ API (Full list)
  const [fullRawData, setFullRawData] = useState<Item[]>([]);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const currentQueryRef = useRef<string>(initialQuery || "");

  // 1. FETCH DATA (Giữ nguyên logic gọi API)
  const fetchData = useCallback(
    async (newQuery?: string) => {
      setLoading(true);
      setCurrentPage(1);

      if (typeof newQuery === "string") {
        currentQueryRef.current = newQuery;
      }
      const activeQuery = currentQueryRef.current.trim();

      const filterOwnItems = (list: Item[]) => {
        if (!userId) return list;
        return list.filter((item) => item.sellerId !== userId);
      };

      try {
        let rawData: Item[] = [];

        if (from === "nearYou") {
          const origin = coords || { lat: 21.0285, lng: 105.8542 };
          rawData = await productApi.getNearBy(origin.lat, origin.lng, 10000);
        } else if (from === "forYou") {
          if (userId) {
            try {
              rawData = await productApi.getForYou(userId);
            } catch {}
          }
          if (!rawData.length) {
            rawData = await productApi.getAll();
          }
        } else {
          if (activeQuery) {
            rawData = await productApi.search(activeQuery, userId, 100);
          } else {
            rawData = await productApi.getAll();
          }
        }

        setFullRawData(filterOwnItems(rawData));
      } catch (e) {
        console.warn("Fetch error", e);
        setFullRawData([]);
      } finally {
        setLoading(false);
      }
    },
    [from, userId, coords?.lat, coords?.lng]
  );

  // 2. XỬ LÝ DỮ LIỆU (Filter -> Sort -> Calculate Distance)
  // Logic này chuyển từ Screen vào Hook để tính được Tổng số chính xác
  const processedFullList = useMemo(() => {
    let data: ItemWithDistance[] = [...fullRawData];

    // A. Tính khoảng cách
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

    // B. Filter
    if (category) data = data.filter((p) => p.category === category);
    if (activeFilter === "zeroPrice") data = data.filter((p) => p.price === 0);
    if (isNearMeActive) {
      data = data.filter((p) => (p.distanceKm || 999) <= 10);
    }

    // C. Sort
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
        if (isNearMeActive) {
          data.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        }
        break;
    }

    return data;
  }, [fullRawData, coords, category, activeFilter, sortType, isNearMeActive]);

  // 3. PHÂN TRANG (Cắt list đã xử lý)
  const paginatedItems = useMemo(() => {
    const endIndex = currentPage * PAGE_SIZE;
    return processedFullList.slice(0, endIndex);
  }, [processedFullList, currentPage]);

  // 4. KIỂM TRA HẾT DATA CHƯA
  const isEnd = paginatedItems.length >= processedFullList.length;

  // 5. LOAD MORE FUNCTION
  const loadMore = useCallback(() => {
    if (isLoadingMore || isEnd || loading) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, isEnd, loading]);

  // Init fetch
  useEffect(() => {
    fetchData(initialQuery);
  }, [fetchData, initialQuery]);

  return {
    items: paginatedItems, // Danh sách để hiển thị (15, 30...)
    totalCount: processedFullList.length, // Tổng số kết quả THỰC TẾ (50, 100...)
    loading,
    isLoadingMore,
    isEnd,
    refetch: (newQuery?: string) => fetchData(newQuery),
    loadMore,
  };
};
