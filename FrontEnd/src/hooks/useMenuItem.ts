import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getAllItemsApi, getItemApi,
  createItemApi, updateItemApi,
  deleteItemApi, toggleItemStatusApi,
  toggleItemAvailabilityApi,
  searchMenuItemsApi,
} from "../api";
import { queryKeys } from "../api/queryKeys";
import type {
  ApiResponse,
  MenuItem,
  UpdateItemParams,
} from "../types/api.types";

// ─── useGetAllItems ───────────────────────────────────────────────────────────
export const useGetAllItems = (
  options?: Omit<UseQueryOptions<ApiResponse<MenuItem[]>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey:  queryKeys.items.lists(),
    queryFn:   getAllItemsApi,
    ...options,
  });
};

// ─── useGetItem ───────────────────────────────────────────────────────────────
export const useGetItem = (
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<MenuItem>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn:  () => getItemApi(id),
    enabled:  !!id,
    ...options,
  });
};

// ─── useCreateItem ────────────────────────────────────────────────────────────
export const useCreateItem = (
  options?: UseMutationOptions<ApiResponse<MenuItem>, Error, FormData>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: createItemApi,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.lists() });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useUpdateItem ────────────────────────────────────────────────────────────
export const useUpdateItem = (
  options?: UseMutationOptions<ApiResponse<MenuItem>, Error, UpdateItemParams>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ id, formData }: UpdateItemParams) => updateItemApi(id, formData),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(variables.id) });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useDeleteItem ────────────────────────────────────────────────────────────
export const useDeleteItem = (
  options?: UseMutationOptions<ApiResponse<null>, Error, string>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: deleteItemApi,
    onSuccess: async (data, id, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.items.detail(id) });
      onSuccess?.(data, id, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useToggleItemStatus ──────────────────────────────────────────────────────
export const useToggleItemStatus = (
  options?: UseMutationOptions<ApiResponse<MenuItem>, Error, string>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: toggleItemStatusApi,
    onSuccess: async (data, id, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(id) });
      onSuccess?.(data, id, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useToggleItemAvailability ────────────────────────────────────────────────
export const useToggleItemAvailability = (
  options?: UseMutationOptions<ApiResponse<MenuItem>, Error, string>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: toggleItemAvailabilityApi,
    onSuccess: async (data, id, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(id) });
      onSuccess?.(data, id, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useSearchMenuItems ───────────────────────────────────────────────────────
export const useSearchMenuItems = (
  params: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    type?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<
    ApiResponse<{
      items: MenuItem[];
      total: number;
      page: number;
      totalPages: number;
    }>
  >
) => {
  return useQuery({
    queryKey: ["menuItems", "search", params],
    queryFn: () => searchMenuItemsApi(params),
    ...options,
  });
};