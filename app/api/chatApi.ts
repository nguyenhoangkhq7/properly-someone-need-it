import api, { type ApiResponse } from "./axiosClient";

export interface ChatRoomPeer {
  id: string;
  name: string;
  avatar: string | null;
}

export interface ChatItemInfo {
  id: string;
  title: string;
  thumbnail: string | null;
  price: number | null;
}

export interface ChatRoomSummary {
  id: string;
  roomId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  role: "buyer" | "seller";
  peer: ChatRoomPeer;
  item: ChatItemInfo | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "LOCATION" | "MEETUP_CONFIRM";
  attachmentUrl: string | null;
  sentAt: string;
  isRead: boolean;
}

export const chatApi = {
  async getRooms(): Promise<ChatRoomSummary[]> {
    const response = await api.get<ApiResponse<ChatRoomSummary[]>>(
      "/chat/rooms"
    );
    return response.data.data;
  },
  async getMessages(
    roomId: string,
    params?: { before?: string; limit?: number }
  ): Promise<ChatMessage[]> {
    const response = await api.get<ApiResponse<ChatMessage[]>>(
      `/chat/rooms/${roomId}/messages`,
      { params }
    );
    return response.data.data;
  },
  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    const response = await api.post<ApiResponse<ChatMessage>>(
      `/chat/rooms/${roomId}/messages`,
      {
        content,
      }
    );
    return response.data.data;
  },
  async markAsRead(roomId: string) {
    const response = await api.patch<
      ApiResponse<{ roomId: string; unreadKey: "buyer" | "seller" }>
    >(`/chat/rooms/${roomId}/read`);
    return response.data.data;
  },
  // 5. [MỚI] Khởi tạo phòng chat (Tìm hoặc Tạo mới)
  // Đã đưa vào bên trong object chatApi để đồng bộ
  async initiateChat(targetId: string): Promise<ChatRoomSummary> {
    // targetId: có thể là sellerId (người bán) hoặc productId (sản phẩm)
    // Tùy backend bạn xử lý logic nào.
    // Thường gửi sellerId là chuẩn nhất.
    const response = await api.post<ApiResponse<ChatRoomSummary>>(
      "/chat/initiate",
      { targetId }
    );

    // Axios response.data đã là ApiResponse
    // return response.data.data sẽ trả về ChatRoomSummary
    return response.data.data;
  },
};
