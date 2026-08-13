import api from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";

export type InventoryItem = {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateInventoryPayload = {
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
};

export type UpdateInventoryPayload = {
  quantity?: number;
  reorderLevel?: number;
  name?: string;
  unit?: string;
};

export const getInventoryApi = (
  params?: { page?: number; limit?: number; search?: string }
): Promise<ApiResponse<{ items: InventoryItem[]; total: number; page: number; totalPages: number }>> =>
  api.get("/inventory", { params }).then((r) => r.data);

export const createInventoryApi = (
  payload: CreateInventoryPayload
): Promise<ApiResponse<InventoryItem>> =>
  api.post("/inventory", payload).then((r) => r.data);

export const updateInventoryApi = (
  id: string,
  payload: UpdateInventoryPayload
): Promise<ApiResponse<InventoryItem>> =>
  api.patch(`/inventory/${id}`, payload).then((r) => r.data);

export const deleteInventoryApi = (id: string): Promise<ApiResponse<{ message: string }>> =>
  api.delete(`/inventory/${id}`).then((r) => r.data);

export const adjustStockApi = (
  id: string,
  amount: number,
  type: "add" | "deduct"
): Promise<ApiResponse<InventoryItem>> =>
  api.patch(`/inventory/${id}/adjust`, { amount, type }).then((r) => r.data);
