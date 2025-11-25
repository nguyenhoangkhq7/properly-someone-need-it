import type { Item } from "./Item";

export type OrderStatus =
  | "PENDING"
  | "NEGOTIATING"
  | "MEETUP_SCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderFilterStatus = OrderStatus | "ALL";

export interface PointLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface OrderMeetupLocation {
  location?: PointLocation;
  address?: string;
}

export interface Order {
  _id: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  status: OrderStatus;
  priceAtPurchase: number;
  createdAt: string;
  updatedAt?: string;
  meetupLocation?: OrderMeetupLocation;
  meetupTime?: string | null;
  cancelledBy?: "BUYER" | "SELLER" | null;
  cancelReason?: string | null;
}

export interface OrderPartySummary {
  _id: string;
  fullName?: string;
  avatar?: string | null;
  phone?: string | null;
  rating?: number;
  reviewCount?: number;
}

export interface OrderListEntryBase {
  order: Order;
  item: Item | null;
}

export interface BuyerOrderListEntry extends OrderListEntryBase {
  seller: OrderPartySummary | null;
}

export interface SellerOrderListEntry extends OrderListEntryBase {
  buyer: OrderPartySummary | null;
}

export interface OrderListResponse<T> {
  orders: T[];
}

export interface OrderDetailPayload {
  order: Order;
  item: Item | null;
  buyer: OrderPartySummary | null;
  seller: OrderPartySummary | null;
}
