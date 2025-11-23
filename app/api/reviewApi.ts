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
  images?: string[];
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
  images?: string[];
}

export interface ReviewEligibilityResponse {
  eligible: boolean;
  reason?: string;
  orderId?: string;
  itemId?: string;
  reviewId?: string;
}

export const fetchShopReviews = async (
  sellerId: string
): Promise<ShopReviewsResponse> => {
  return apiClient.get(`/reviews/${sellerId}`);
};

export const checkReviewEligibility = async (
  sellerId: string,
  accessToken: string
): Promise<ReviewEligibilityResponse> => {
  return apiClient.get(`/reviews/eligible/${sellerId}`, undefined, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createShopReview = async (
  payload: CreateReviewPayload,
  accessToken: string
): Promise<ShopReview> => {
  return apiClient.post(`/reviews`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
