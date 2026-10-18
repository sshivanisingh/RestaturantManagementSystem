
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import {
  getAllTablesApi,
  getAvailableTablesApi,
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

const publicTableQueryKey = ["tables", "public", "available"] as const;

type TableListOptions = Omit<
  UseQueryOptions<ApiResponse<Table[]>, Error>,
  "queryKey" | "queryFn"
>;

// Public: for the customer reservation page.
// Backend must expose GET /tables/available without admin authentication.
export const useGetAvailableTables = (options?: TableListOptions) => {
  return useQuery({
    queryKey: publicTableQueryKey,
    queryFn: getAvailableTablesApi,
    ...options,
  });
};

// Admin: retain existing table-management behavior.
export const useGetAllTables = (options?: TableListOptions) => {
  return useQuery({
    queryKey: queryKeys.tables.lists(),
    queryFn: getAllTablesApi,
    ...options,
  });
};

export const useGetTable = (
  id: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<Table>, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: queryKeys.tables.detail(id),
    queryFn: () => getTableApi(id),
    enabled: Boolean(id),
    ...options,
  });
};

export const useCreateTable = (
  options?: UseMutationOptions<
    ApiResponse<Table>,
    Error,
    Pick<Table, "tableLabel"> & { status?: Table["status"] }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: createTableApi,
    ...restOptions,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: publicTableQueryKey,
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};

export const useUpdateTable = (
  options?: UseMutationOptions<
    ApiResponse<Table>,
    Error,
    UpdateTableParams
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ id, data }: UpdateTableParams) =>
      updateTableApi(id, data),
    ...restOptions,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.id),
        }),
        queryClient.invalidateQueries({
          queryKey: publicTableQueryKey,
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};

export const useDeleteTable = (
  options?: UseMutationOptions<ApiResponse<null>, Error, string>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: deleteTableApi,
    ...restOptions,
    onSuccess: async (data, id, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: publicTableQueryKey,
        }),
      ]);

      queryClient.removeQueries({
        queryKey: queryKeys.tables.detail(id),
      });

      onSuccess?.(data, id, context, undefined as any);
    },
  });
};

export const useUpdateTableStatus = (
  options?: UseMutationOptions<
    ApiResponse<Table>,
    Error,
    { id: string } & UpdateTableStatusParams
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string } & UpdateTableStatusParams) =>
      updateTableStatusApi(id, data),
    ...restOptions,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.id),
        }),
        queryClient.invalidateQueries({
          queryKey: publicTableQueryKey,
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};
