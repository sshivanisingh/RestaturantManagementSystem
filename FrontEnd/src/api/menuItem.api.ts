import api from "./axiosInstance";
import type { ApiResponse, MenuItem } from "../types/api.types";

// ─── Menu Item API ────────────────────────────────────────────────────────────

export const getAllItemsApi = (): Promise<ApiResponse<MenuItem[]>> =>
  api
    .get<ApiResponse<MenuItem[]>>("/menu-items")
    .then((r) => r.data);

export const getItemApi = (id: string): Promise<ApiResponse<MenuItem>> =>
  api
    .get<ApiResponse<MenuItem>>(`/menu-items/${id}`)
    .then((r) => r.data);

export const createItemApi = (
  formData: FormData
): Promise<ApiResponse<MenuItem>> =>
  api
    .post<ApiResponse<MenuItem>>("/menu-items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const updateItemApi = (
  id: string,
  formData: FormData
): Promise<ApiResponse<MenuItem>> =>
  api
    .patch<ApiResponse<MenuItem>>(`/menu-items/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const deleteItemApi = (id: string): Promise<ApiResponse<null>> =>
  api
    .delete<ApiResponse<null>>(`/menu-items/${id}`)
    .then((r) => r.data);

export const toggleItemStatusApi = (
  id: string
): Promise<ApiResponse<MenuItem>> =>
  api
    .patch<ApiResponse<MenuItem>>(`/menu-items/${id}/toggle-status`)
    .then((r) => r.data);

export const toggleItemAvailabilityApi = (
  id: string
): Promise<ApiResponse<MenuItem>> =>
  api
    .patch<ApiResponse<MenuItem>>(`/menu-items/${id}/toggle-availability`)
    .then((r) => r.data);

export const searchMenuItemsApi = (
  params: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    type?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }
): Promise<
  ApiResponse<{
    items: MenuItem[];
    total: number;
    page: number;
    totalPages: number;
  }>
> =>
  api
    .get("/menu-items/search", { params })
    .then((r) => r.data);
