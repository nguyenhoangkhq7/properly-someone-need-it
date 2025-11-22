import { io, type Socket } from "socket.io-client";
import { getSocketBaseUrl } from "../config/api";

let chatSocket: Socket | null = null;
let cachedToken: string | null = null;

export const getChatSocket = (accessToken: string | null): Socket | null => {
  if (!accessToken) {
    return null;
  }

  if (chatSocket && cachedToken === accessToken) {
    if (!chatSocket.connected) {
      chatSocket.connect();
    }
    return chatSocket;
  }

  if (chatSocket) {
    chatSocket.disconnect();
  }

  chatSocket = io(getSocketBaseUrl(), {
    transports: ["websocket"],
    auth: { token: accessToken },
  });
  cachedToken = accessToken;

  return chatSocket;
};

export const disconnectChatSocket = () => {
  chatSocket?.disconnect();
  chatSocket = null;
  cachedToken = null;
};
