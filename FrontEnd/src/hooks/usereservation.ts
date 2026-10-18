import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import {
  createReservationApi,
  getReservationsApi,
  getAllReservationsApi,
  updateReservationApi,
  confirmReservationApi,
  cancelReservationApi,
  checkInApi,
  checkOutApi,
  markNoShowApi,
} from "../api";

import { queryKeys } from "../api/queryKeys";

import type {
  ApiResponse,
  Reservation,
  CreateReservationParams,
  UpdateReservationParams,
} from "../types/api.types";

// ─── Query options ────────────────────────────────────────────────────────────

type ReservationListOptions = Omit<
  UseQueryOptions<ApiResponse<Reservation[]>, Error>,
  "queryKey" | "queryFn"
>;

// ─── Get all reservations (restaurant/admin) ──────────────────────────────────
// GET /api/v1/table/reservations/all

export const useGetAllReservations = (
  options?: ReservationListOptions
) => {
  return useQuery({
    queryKey: queryKeys.reservations.all(),
    queryFn: getAllReservationsApi,
    ...options,
  });
};

// ─── Get reservations for a table (restaurant/admin) ──────────────────────────
// GET /api/v1/table/:id/reservations?status=&date=

export const useGetReservations = (
  tableId: string,
  params?: { status?: string; date?: string },
  options?: ReservationListOptions
) => {
  return useQuery({
    queryKey: queryKeys.reservations.list(tableId, params),
    queryFn: () => getReservationsApi(tableId, params),
    enabled: Boolean(tableId),
    ...options,
  });
};

// ─── Create reservation (customer/guest) ──────────────────────────────────────
// POST /api/v1/table/:id/reservations

export const useCreateReservation = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; data: CreateReservationParams }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      tableId,
      data,
    }: {
      tableId: string;
      data: CreateReservationParams;
    }) => createReservationApi(tableId, data),

    ...restOptions,

    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.list(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["tables", "public", "available"],
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};

// ─── Update reservation (restaurant/admin) ───────────────────────────────────
// PATCH /api/v1/table/:id/reservations/:reservationId

export const useUpdateReservation = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    {
      tableId: string;
      reservationId: string;
      data: UpdateReservationParams;
    }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      tableId,
      reservationId,
      data,
    }: {
      tableId: string;
      reservationId: string;
      data: UpdateReservationParams;
    }) => updateReservationApi(tableId, reservationId, data),

    ...restOptions,

    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.list(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.detail(
            variables.tableId,
            variables.reservationId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["tables", "public", "available"],
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};

// ─── Confirm reservation (restaurant/admin) ────────────────────────────────────

export const useConfirmReservation = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      tableId,
      reservationId,
    }: {
      tableId: string;
      reservationId: string;
    }) => confirmReservationApi(tableId, reservationId),

    ...restOptions,

    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.list(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.detail(
            variables.tableId,
            variables.reservationId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["tables", "public", "available"],
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};

// ─── Cancel reservation ───────────────────────────────────────────────────────

export const useCancelReservation = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string; reason?: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      tableId,
      reservationId,
      reason,
    }: {
      tableId: string;
      reservationId: string;
      reason?: string;
    }) => cancelReservationApi(tableId, reservationId, { reason }),

    ...restOptions,

    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.list(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.detail(
            variables.tableId,
            variables.reservationId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["tables", "public", "available"],
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};

// ─── Check in reservation (restaurant/admin) ──────────────────────────────────

export const useCheckIn = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      tableId,
      reservationId,
    }: {
      tableId: string;
      reservationId: string;
    }) => checkInApi(tableId, reservationId),

    ...restOptions,

    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.list(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.detail(
            variables.tableId,
            variables.reservationId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["tables", "public", "available"],
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};

// ─── Check out reservation (restaurant/admin) ────────────────────────────────

export const useCheckOut = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      tableId,
      reservationId,
    }: {
      tableId: string;
      reservationId: string;
    }) => checkOutApi(tableId, reservationId),

    ...restOptions,

    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.list(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.detail(
            variables.tableId,
            variables.reservationId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["tables", "public", "available"],
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};

// ─── Mark reservation as no-show ──────────────────────────────────────────────

export const useMarkNoShow = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({
      tableId,
      reservationId,
    }: {
      tableId: string;
      reservationId: string;
    }) => markNoShowApi(tableId, reservationId),

    ...restOptions,

    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.list(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.detail(
            variables.tableId,
            variables.reservationId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reservations.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.detail(variables.tableId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tables.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["tables", "public", "available"],
        }),
      ]);

      onSuccess?.(data, variables, context, undefined as any);
    },
  });
};
