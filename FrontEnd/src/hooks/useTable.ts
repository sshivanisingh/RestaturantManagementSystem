
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

// Public: customer reservation page.
// Backend endpoint: GET /table/public (no authentication required).
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
    ...restOptions,
    mutationFn: createTableApi,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: publicTableQueryKey,
        }),
      ]);

      await onSuccess?.(data, variables, context);
    },
  });
};

export const useUpdateTable = (
  options?: UseMutationOptions<ApiResponse<Table>, Error, UpdateTableParams>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ id, data }) => updateTableApi(id, data),
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

      await onSuccess?.(data, variables, context);
    },
  });
};

export const useDeleteTable = (
  options?: UseMutationOptions<ApiResponse<null>, Error, string>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationFn: deleteTableApi,
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

      await onSuccess?.(data, id, context);
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
    ...restOptions,
    mutationFn: ({ id, ...data }) => updateTableStatusApi(id, data),
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

      await onSuccess?.(data, variables, context);
    },
  });
};
