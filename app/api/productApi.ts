import { apiClient } from "./apiWrapper";
import type { Item } from "../types/Item";

export const productApi = {
  getAll: () => apiClient.get<Item[]>("/items"),

  getById: (id: string) => apiClient.get<Item>(`/items/${id}`),

  getByCategory: (category: string) =>
    apiClient.get<Item[]>(`/items/category/${category}`),

  getRecommended: (userId: string) =>
    apiClient.get<Item[]>(`/items/recommended/${userId}`),

  getNearBy: (lat: number, lng: number, radius = 5000) =>
    apiClient.get<Item[]>("/items/nearby", { lat, lng, radius }),

  getNewItems: () => apiClient.get<Item[]>("/items/new"),
};
