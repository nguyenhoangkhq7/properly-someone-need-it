import api, { ApiResponse } from "./axiosClient";

export interface AccountProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: "user" | "admin";
  address: {
    city: string | null;
    district: string | null;
    location?: {
      type: "Point";
      coordinates: [number, number];
    } | null;
  };
  rating: number;
  reviewCount: number;
  trustScore: number;
  successfulTrades: number;
}

export const fetchCurrentUser = async (): Promise<AccountProfile> => {
  const response = await api.get<ApiResponse<AccountProfile>>("/auth/me");
  return response.data.data;
};
