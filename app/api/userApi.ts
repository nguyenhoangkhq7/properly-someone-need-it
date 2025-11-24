import api, { ApiResponse } from "./axiosClient";
import type { AccountProfile } from "./authApi";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  avatar?: string | null;
  address?: {
    city?: string | null;
    district?: string | null;
    location?: {
      type: "Point";
      coordinates: [number, number];
    } | null;
  };
}

export const updateMyProfile = async (
  payload: UpdateProfilePayload
): Promise<AccountProfile> => {
  const response = await api.put<ApiResponse<AccountProfile>>("/users/me", payload);
  return response.data.data;
};
