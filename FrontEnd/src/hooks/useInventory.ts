import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import type { ApiResponse } from "../types/api.types";
import type {
  InventoryItem,
  CreateInventoryPayload,
  UpdateInventoryPayload,
} from "../api/inventory.api";
import {
  getInventoryApi,
  createInventoryApi,
  updateInventoryApi,
  deleteInventoryApi,
  adjustStockApi,
} from "../api/inventory.api";

export const useGetInventory = (
  params?: { page?: number; limit?: number; search?: string },
  options?: UseQueryOptions<ApiResponse<{ items: InventoryItem[]; total: number; page: number; totalPages: number }>>
) =>
  useQuery({
    queryKey: ["inventory", params],
    queryFn: () => getInventoryApi(params),
    ...options,
  });

export const useCreateInventory = (
  options?: UseMutationOptions<
    ApiResponse<InventoryItem>,
    unknown,
    CreateInventoryPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInventoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    ...options,
  });
};

export const useUpdateInventory = (
  options?: UseMutationOptions<
    ApiResponse<InventoryItem>,
    unknown,
    { id: string; payload: UpdateInventoryPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateInventoryApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    ...options,
  });
};

export const useDeleteInventory = (
  options?: UseMutationOptions<
    ApiResponse<{ message: string }>,
    unknown,
    string
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInventoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    ...options,
  });
};

export const useAdjustStock = (
  options?: UseMutationOptions<
    ApiResponse<InventoryItem>,
    unknown,
    { id: string; amount: number; type: "add" | "deduct" }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, type }) => adjustStockApi(id, amount, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    ...options,
  });
};
