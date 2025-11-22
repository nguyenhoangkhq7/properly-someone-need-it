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

export interface TypingLogEntry {
  userId: string;
  action: "START" | "STOP";
  timestamp: string;
}

export interface TypingCurrentEntry {
  userId: string;
  since: string;
}

export interface TypingLogSnapshot {
  history: TypingLogEntry[];
  current: TypingCurrentEntry[];
}

export const chatApi = {
  async getRooms(): Promise<ChatRoomSummary[]> {
    const response = await api.get<ApiResponse<ChatRoomSummary[]>>("/chat/rooms");
    return response.data.data;
  },
  async getMessages(roomId: string, params?: { before?: string; limit?: number }): Promise<ChatMessage[]> {
    const response = await api.get<ApiResponse<ChatMessage[]>>(
      `/chat/rooms/${roomId}/messages`,
      { params }
    );
    return response.data.data;
  },
  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    const response = await api.post<ApiResponse<ChatMessage>>(`/chat/rooms/${roomId}/messages`, {
      content,
    });
    return response.data.data;
  },
  async markAsRead(roomId: string) {
    const response = await api.patch<ApiResponse<{ roomId: string; unreadKey: "buyer" | "seller" }>>(
      `/chat/rooms/${roomId}/read`
    );
    return response.data.data;
  },
  async getTypingLogs(roomId: string): Promise<TypingLogSnapshot> {
    const response = await api.get<ApiResponse<TypingLogSnapshot>>(
      `/chat/rooms/${roomId}/typing-logs`
    );
    return response.data.data;
  },
  async clearTypingLogs(roomId: string) {
    const response = await api.delete<ApiResponse<{ roomId: string }>>(
      `/chat/rooms/${roomId}/typing-logs`
    );
    return response.data.data;
  },
};
