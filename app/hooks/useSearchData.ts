// hooks/useSearchData.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { productApi } from "../api/productApi";
import type { Item } from "../types/Item";

type SearchParams = {
  query?: string;
  from?: "nearYou" | "forYou" | "search";
  userId?: string;
  coords?: { lat: number; lng: number } | null;
  category?: string;
};

export const useSearchData = ({
  query,
  from,
  userId,
  coords,
}: SearchParams) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const lastQuery = useRef<string>("");

  const fetchData = useCallback(
    async (overrideQuery?: string) => {
      setLoading(true);
      try {
        // 1. Logic cho "Gần bạn"
        if (from === "nearYou") {
          const origin = coords || { lat: 21.0285, lng: 105.8542 }; // Fallback HN
          const data = await productApi.getNearBy(
            origin.lat,
            origin.lng,
            10000
          ); // 10km
          setItems(data);
          return;
        }

        // 2. Logic cho "Dành cho bạn"
        if (from === "forYou") {
          let data: Item[] = [];
          if (userId) {
            try {
              data = await productApi.getForYou(userId);
            } catch {}
          }
          if (!data.length) {
            data = await productApi.getNewItems();
          }
          setItems(data);
          return;
        }

        // 3. Logic Search thuần túy (Semantic/Text)
        const searchQuery = (overrideQuery ?? query ?? "").trim();

        // Tránh search lại nếu query không đổi (trừ khi pull-to-refresh)
        // if (lastQuery.current === searchQuery && !overrideQuery) return;

        lastQuery.current = searchQuery;

        if (searchQuery) {
          const data = await productApi.search(searchQuery, userId, 50);
          setItems(data);
        } else {
          const data = await productApi.getAll(); // Empty query -> Get All
          setItems(data);
        }
      } catch (e) {
        console.warn("Search fetch error", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [from, query, userId, coords?.lat, coords?.lng]
  );

  // Tự động fetch lần đầu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, loading, refetch: fetchData };
};
