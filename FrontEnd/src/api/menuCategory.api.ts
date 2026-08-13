import api from "./axiosInstance";
import type {
  ApiResponse,
  MenuCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/api.types";

// ─── Menu Category API ────────────────────────────────────────────────────────

export const getAllCategoriesApi = (): Promise<ApiResponse<MenuCategory[]>> =>
  api
    .get<ApiResponse<MenuCategory[]>>("/menu-categories")
    .then((r) => r.data);

export const getCategoryApi = (id: string): Promise<ApiResponse<MenuCategory>> =>
  api
    .get<ApiResponse<MenuCategory>>(`/menu-categories/${id}`)
    .then((r) => r.data);

export const createCategoryApi = (
  payload: CreateCategoryPayload
): Promise<ApiResponse<MenuCategory>> =>
  api
    .post<ApiResponse<MenuCategory>>("/menu-categories", payload)
    .then((r) => r.data);

export const updateCategoryApi = (
  id: string,
  payload: UpdateCategoryPayload
): Promise<ApiResponse<MenuCategory>> =>
  api
    .patch<ApiResponse<MenuCategory>>(`/menu-categories/${id}`, payload)
    .then((r) => r.data);

export const deleteCategoryApi = (id: string): Promise<ApiResponse<null>> =>
  api
    .delete<ApiResponse<null>>(`/menu-categories/${id}`)
    .then((r) => r.data);

export const toggleCategoryStatusApi = (
  id: string
): Promise<ApiResponse<MenuCategory>> =>
  api
    .patch<ApiResponse<MenuCategory>>(`/menu-categories/${id}/toggle`)
    .then((r) => r.data);
