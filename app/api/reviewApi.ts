import api, { type ApiResponse } from "./axiosClient";
import type { AxiosResponse } from "axios";

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

const unwrap = async <T>(promise: Promise<AxiosResponse<ApiResponse<T>>>) => {
  const response = await promise;
  return response.data.data;
};

export const fetchShopReviews = async (
  sellerId: string
): Promise<ShopReviewsResponse> => {
  return unwrap<ShopReviewsResponse>(
    api.get<ApiResponse<ShopReviewsResponse>>(`/reviews/${sellerId}`)
  );
};

export const checkReviewEligibility = async (
  sellerId: string
): Promise<ReviewEligibilityResponse> => {
  return unwrap<ReviewEligibilityResponse>(
    api.get<ApiResponse<ReviewEligibilityResponse>>(`/reviews/eligible/${sellerId}`)
  );
};

export const createShopReview = async (
  payload: CreateReviewPayload
): Promise<ShopReview> => {
  return unwrap<ShopReview>(api.post<ApiResponse<ShopReview>>(`/reviews`, payload));
};
