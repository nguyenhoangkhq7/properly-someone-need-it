import api, { ApiClientError } from "./axiosClient";
import type {
  BuyerOrderListEntry,
  Order,
  OrderDetailPayload,
  OrderFilterStatus,
  OrderListResponse,
  OrderStatus,
  SellerOrderListEntry,
} from "../types/Order";

export interface CreateOrderPayload {
  itemId: string;
}

interface OrderResponse {
  order: Order;
}

interface OrderListParams {
  userId?: string;
  status?: OrderFilterStatus;
}

const buildStatusQuery = (status?: OrderFilterStatus) => {
  if (!status || status === "ALL") {
    return "";
  }
  return `?status=${encodeURIComponent(status)}`;
};

export const orderApi = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    if (!payload.itemId) {
      const error: ApiClientError = {
        message: "Thiếu itemId khi tạo đơn hàng",
        status: 400,
      };
      throw error;
    }

    const response = await api.post<OrderResponse>("/orders", payload);
    if (!response.data?.order) {
      throw new Error("Order API không trả về dữ liệu hợp lệ");
    }

    return response.data.order;
  },

  async getBuyerOrders({ userId, status }: OrderListParams): Promise<BuyerOrderListEntry[]> {
    if (!userId) {
      throw new Error("Thiếu userId khi lấy đơn mua hàng");
    }

    const response = await api.get<OrderListResponse<BuyerOrderListEntry>>(
      `/orders/buyer/${userId}${buildStatusQuery(status)}`
    );

    return response.data.orders ?? [];
  },

  async getSellerOrders({ userId, status }: OrderListParams): Promise<SellerOrderListEntry[]> {
    if (!userId) {
      throw new Error("Thiếu userId khi lấy đơn bán hàng");
    }

    const response = await api.get<OrderListResponse<SellerOrderListEntry>>(
      `/orders/seller/${userId}${buildStatusQuery(status)}`
    );

    return response.data.orders ?? [];
  },

  async getById(orderId: string): Promise<OrderDetailPayload> {
    if (!orderId) {
      throw new Error("Thiếu orderId khi xem chi tiết đơn hàng");
    }

    const response = await api.get<OrderDetailPayload>(`/orders/${orderId}`);

    if (!response.data?.order) {
      throw new Error("Không nhận được dữ liệu chi tiết đơn hàng");
    }

    return {
      order: response.data.order,
      item: response.data.item ?? null,
      buyer: response.data.buyer ?? null,
      seller: response.data.seller ?? null,
    };
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    if (!orderId) {
      throw new Error("Thiếu orderId khi cập nhật trạng thái");
    }

    const response = await api.patch<OrderResponse>(`/orders/${orderId}/status`, {
      status,
    });

    return response.data.order;
  },
};
