import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "../config/api";

// ---- Kiểu trả về chung ----
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ---- Base URL ----
const API_BASE_URL = getApiBaseUrl();

// ---- Tạo axios instance ----
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Không có token, interceptor để trống ----
api.interceptors.request.use((config: any) => {
  return config;
});

// ---- Xử lý lỗi ----
function handleError(error: AxiosError): never {
  const message =
    (error.response?.data as any)?.message ||
    error.message ||
    "Unknown API error";

  throw new Error(message);
}

// ---- Wrapper ----
export const apiClient = {
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res: AxiosResponse<ApiResponse<T>> = await api.get(url, {
        ...(config ?? {}),
        params,
      });
      return res.data.data;
    } catch (err) {
      handleError(err as AxiosError);
    }
  },

  async post<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res: AxiosResponse<ApiResponse<T>> = await api.post(url, body, config);
      return res.data.data;
    } catch (err) {
      handleError(err as AxiosError);
    }
  },

  async put<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res: AxiosResponse<ApiResponse<T>> = await api.put(url, body, config);
      return res.data.data;
    } catch (err) {
      handleError(err as AxiosError);
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res: AxiosResponse<ApiResponse<T>> = await api.delete(url, config);
      return res.data.data;
    } catch (err) {
      handleError(err as AxiosError);
    }
  },
};