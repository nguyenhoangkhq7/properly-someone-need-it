import api, { type ApiResponse } from "./axiosClient";
import type { AxiosResponse } from "axios";
import type { Item } from "../types/Item";

const unwrap = async <T>(promise: Promise<AxiosResponse<ApiResponse<T>>>) => {
  const response = await promise;
  return response.data.data;
};

type ItemsResponse = ApiResponse<Item[]> | { items?: Item[] };
interface ItemDetailResponse {
  item?: Item;
}

export const productApi = {
  getAll: async () => unwrap<Item[]>(api.get<ApiResponse<Item[]>>("/items")),

  getById: async (id: string, userId?: string) =>
    unwrap<Item>(
      api.get<ApiResponse<Item>>(`/items/${id}`, {
        params: userId ? { userId } : undefined,
      })
    ),

  getByCategory: async (category: string) =>
    unwrap<Item[]>(api.get<ApiResponse<Item[]>>(`/items/category/${category}`)),

  getRecommended: async (userId: string) =>
    unwrap<Item[]>(api.get<ApiResponse<Item[]>>(`/items/recommended/${userId}`)),

  getForYou: async (userId: string) =>
    unwrap<Item[]>(api.get<ApiResponse<Item[]>>(`/items/for-you/${userId}`)),

  search: async (query: string, userId?: string, limit = 50) =>
    unwrap<Item[]>(
      api.get<ApiResponse<Item[]>>("/search", {
        params: { q: query, userId, limit },
      })
    ),

  getNearBy: async (lat: number, lng: number, radius = 5000) =>
    unwrap<Item[]>(
      api.get<ApiResponse<Item[]>>("/items/nearby", {
        params: { lat, lng, radius },
      })
    ),

  getNewItems: async () => unwrap<Item[]>(api.get<ApiResponse<Item[]>>("/items/new")),

  getBySeller: async (sellerId: string) => {
    if (!sellerId) {
      throw new Error("Thiếu sellerId");
    }

    const response = await api.get<ItemsResponse>(`/items/seller/${sellerId}`);
    if ("data" in response.data) {
      return response.data.data ?? [];
    }

    return response.data.items ?? [];
  },

  getSellerItemById: async (itemId: string) => {
    if (!itemId) {
      throw new Error("Thiếu itemId");
    }

    const response = await api.get<ItemDetailResponse>(`/items/${itemId}`);
    if (!response.data?.item) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    return response.data.item;
  },

  updateItemStatus: async (itemId: string, status: Item["status"]) => {
    if (!itemId) {
      throw new Error("Thiếu itemId");
    }

    const response = await api.patch<ItemDetailResponse>(
      `/items/${itemId}/status`,
      { status }
    );

    if (!response.data?.item) {
      throw new Error("Không cập nhật được trạng thái sản phẩm");
    }

    return response.data.item;
  },
};
