import { apiClient } from "../utils/api";

export interface ReviewerProfile {
  _id: string;
  fullName: string;
  avatar?: string | null;
  address?: {
    city?: string | null;
    district?: string | null;
  };
}

export interface ShopReview {
  _id: string;
  sellerId: string;
  reviewerId: ReviewerProfile;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
}

export interface ShopReviewsResponse {
  reviews: ShopReview[];
  stats: ReviewStats;
}

export interface CreateReviewPayload {
  sellerId: string;
  rating: number;
  comment?: string;
}

export const fetchShopReviews = async (
  sellerId: string
): Promise<ShopReviewsResponse> => {
  return apiClient.get(`/api/reviews/${sellerId}`);
};

export const createShopReview = async (
  payload: CreateReviewPayload,
  accessToken: string
): Promise<ShopReview> => {
  return apiClient.post(`/api/reviews`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
