import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getAllTablesApi,
  getTableApi,
  createTableApi,
  updateTableApi,
  deleteTableApi,
  updateTableStatusApi,
} from "../api";


import { queryKeys } from "../api/queryKeys";
import type {
  ApiResponse,
  Table,
  UpdateTableParams,
  UpdateTableStatusParams,
} from "../types/api.types";

// ─── useGetAllTables ──────────────────────────────────────────────────────────
export const useGetAllTables = (
  options?: Omit<UseQueryOptions<ApiResponse<Table[]>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey:  queryKeys.tables.lists(),
    queryFn:   getAllTablesApi,
    ...options,
  });
};

// ─── useGetTable ──────────────────────────────────────────────────────────────
export const useGetTable = (
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<Table>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: queryKeys.tables.detail(id),
    queryFn:  () => getTableApi(id),
    enabled:  !!id,
    ...options,
  });
};

// ─── useCreateTable ───────────────────────────────────────────────────────────
export const useCreateTable = (
  options?: UseMutationOptions<
    ApiResponse<Table>,
    Error,
    Pick<Table, "tableLabel"> & { status?: Table["status"] }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: createTableApi,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tables.lists() });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};


// ─── useUpdateTable ───────────────────────────────────────────────────────────
export const useUpdateTable = (
  options?: UseMutationOptions<ApiResponse<Table>, Error, UpdateTableParams>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ id, data }: UpdateTableParams) => updateTableApi(id, data),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tables.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tables.detail(variables.id) });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useDeleteTable ───────────────────────────────────────────────────────────
export const useDeleteTable = (
  options?: UseMutationOptions<ApiResponse<null>, Error, string>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: deleteTableApi,
    onSuccess: async (data, id, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tables.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.tables.detail(id) });
      onSuccess?.(data, id, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useUpdateTableStatus ─────────────────────────────────────────────────────
export const useUpdateTableStatus = (
  options?: UseMutationOptions<
    ApiResponse<Table>,
    Error,
    { id: string } & UpdateTableStatusParams
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateTableStatusParams) =>
      updateTableStatusApi(id, data),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tables.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tables.detail(variables.id) });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};