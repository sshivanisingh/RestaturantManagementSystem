import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getAllCategoriesApi, getCategoryApi,
  createCategoryApi,  updateCategoryApi,
  deleteCategoryApi,  toggleCategoryStatusApi,
} from "../api";
import { queryKeys } from "../api/queryKeys";
import type {
  ApiResponse,
  MenuCategory,
  CreateCategoryPayload,
  UpdateCategoryParams,
} from "../types/api.types";

// ─── useGetAllCategories ──────────────────────────────────────────────────────
export const useGetAllCategories = (
  options?: Omit<
    UseQueryOptions<ApiResponse<MenuCategory[]>, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey:  queryKeys.categories.lists(),
    queryFn:   getAllCategoriesApi,
    ...options,
  });
};



// ─── useGetCategory ───────────────────────────────────────────────────────────
export const useGetCategory = (
  id: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<MenuCategory>, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn:  () => getCategoryApi(id),
    enabled:  !!id,
    ...options,
  });
};




// ─── useCreateCategory ────────────────────────────────────────────────────────
export const useCreateCategory = (
  options?: UseMutationOptions<ApiResponse<MenuCategory>, Error, CreateCategoryPayload>
) => {
  const queryClient = useQueryClient();

  // Destructure onSuccess out — so spread does NOT override our invalidation logic
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: createCategoryApi,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useUpdateCategory ────────────────────────────────────────────────────────
export const useUpdateCategory = (
  options?: UseMutationOptions<ApiResponse<MenuCategory>, Error, UpdateCategoryParams>
) => {
  const queryClient = useQueryClient();

  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};
   
  return useMutation({
    mutationFn: ({ id, payload }: UpdateCategoryParams) => updateCategoryApi(id, payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(variables.id) });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useDeleteCategory ────────────────────────────────────────────────────────
export const useDeleteCategory = (
  options?: UseMutationOptions<ApiResponse<null>, Error, string>
) => {
  const queryClient = useQueryClient();

  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: async (data, id, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) });
      onSuccess?.(data, id, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useToggleCategoryStatus ──────────────────────────────────────────────────
export const useToggleCategoryStatus = (
  options?: UseMutationOptions<ApiResponse<MenuCategory>, Error, string>
) => {
  const queryClient = useQueryClient();

  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: toggleCategoryStatusApi,
    onSuccess: async (data, id, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(id) });
      onSuccess?.(data, id, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};