import { apiClient } from "./apiWrapper";
import type { Item } from "../types/Item";

export const productApi = {
  getAll: () => apiClient.get<Item[]>("/items"),

  getById: (id: string, userId?: string) =>
    apiClient.get<Item>(`/items/${id}`, userId ? { userId } : undefined),

  getByCategory: (category: string) =>
    apiClient.get<Item[]>(`/items/category/${category}`),

  getRecommended: (userId: string) =>
    apiClient.get<Item[]>(`/items/recommended/${userId}`),

  getForYou: (userId: string) =>
    apiClient.get<Item[]>(`/items/for-you/${userId}`),

  search: (query: string, userId?: string, limit = 50) =>
    apiClient.get<Item[]>("/search", { q: query, userId, limit }),

  getNearBy: (lat: number, lng: number, radius = 5000) =>
    apiClient.get<Item[]>("/items/nearby", { lat, lng, radius }),

  getNewItems: () => apiClient.get<Item[]>("/items/new"),
};
