// src/types/item.ts

export type ItemCategory =
  | "PHONE"
  | "LAPTOP"
  | "TABLET"
  | "WATCH"
  | "HEADPHONE"
  | "ACCESSORY"
  | "OTHER";

export type ItemCondition = "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";

export interface ItemLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Item {
  _id: string;
  sellerId: string;

  title: string;
  description: string;

  category: ItemCategory;
  subcategory?: string;
  brand?: string;
  modelName?: string;

  condition: ItemCondition;

  price: number;
  isNegotiable: boolean;

  images: string[];
  location: ItemLocation;

  status: "ACTIVE" | "PENDING" | "SOLD" | "DELETED";

  views: number;
  favoritesCount: number;

  // JSON từ API → string
  createdAt: string;
  updatedAt: string;
}
export type ItemWithDistance = Item & {
  distanceKm?: number;
};
