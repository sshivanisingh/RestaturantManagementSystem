// hooks/useReservation.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
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
  CancelReservationParams,
} from "../types/api.types";

// ─── useGetAllReservations ────────────────────────────────────────────────────
// GET /tables/reservations/all
export const useGetAllReservations = (
  options?: Omit<UseQueryOptions<ApiResponse<Reservation[]>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: queryKeys.reservations.all(),
    queryFn: getAllReservationsApi,
    ...options,
  });
};

// ─── useGetReservations ───────────────────────────────────────────────────────
// GET /tables/:id/reservations?status=&date=
export const useGetReservations = (
  tableId: string,
  params?: { status?: string; date?: string },
  options?: Omit<UseQueryOptions<ApiResponse<Reservation[]>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: queryKeys.reservations.list(tableId, params),
    queryFn: () => getReservationsApi(tableId, params),
    enabled: !!tableId,
    ...options,
  });
};

// ─── useCreateReservation ─────────────────────────────────────────────────────
// POST /tables/:id/reservations
export const useCreateReservation = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; data: CreateReservationParams }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ tableId, data }: { tableId: string; data: CreateReservationParams }) =>
      createReservationApi(tableId, data),
    onSuccess: async (data, variables, context) => {
      // Invalidate table reservations list
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.list(variables.tableId),
      });
      // Invalidate all reservations
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.all(),
      });
      // Invalidate table detail (might affect table status)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tables.detail(variables.tableId),
      });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useUpdateReservation ─────────────────────────────────────────────────────
// PATCH /tables/:id/reservations/:reservationId
export const useUpdateReservation = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string; data: UpdateReservationParams }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ tableId, reservationId, data }: { tableId: string; reservationId: string; data: UpdateReservationParams }) =>
      updateReservationApi(tableId, reservationId, data),
    onSuccess: async (data, variables, context) => {
      // Invalidate reservations list
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.list(variables.tableId),
      });
      // Invalidate specific reservation detail (if you have one)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.detail(variables.tableId, variables.reservationId),
      });
      // Invalidate all reservations
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.all(),
      });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useConfirmReservation ────────────────────────────────────────────────────
// PATCH /tables/:id/reservations/:reservationId/confirm
export const useConfirmReservation = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ tableId, reservationId }: { tableId: string; reservationId: string }) =>
      confirmReservationApi(tableId, reservationId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.list(variables.tableId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.detail(variables.tableId, variables.reservationId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.all(),
      });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useCancelReservation ─────────────────────────────────────────────────────
// PATCH /tables/:id/reservations/:reservationId/cancel
export const useCancelReservation = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string; reason?: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ tableId, reservationId, reason }: { tableId: string; reservationId: string; reason?: string }) =>
      cancelReservationApi(tableId, reservationId, { reason }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.list(variables.tableId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.detail(variables.tableId, variables.reservationId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.all(),
      });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useCheckIn ───────────────────────────────────────────────────────────────
// PATCH /tables/:id/reservations/:reservationId/checkin
export const useCheckIn = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ tableId, reservationId }: { tableId: string; reservationId: string }) =>
      checkInApi(tableId, reservationId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.list(variables.tableId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.detail(variables.tableId, variables.reservationId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.all(),
      });
      // Table status might have changed
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tables.detail(variables.tableId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tables.lists(),
      });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useCheckOut ──────────────────────────────────────────────────────────────
// PATCH /tables/:id/reservations/:reservationId/checkout
export const useCheckOut = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ tableId, reservationId }: { tableId: string; reservationId: string }) =>
      checkOutApi(tableId, reservationId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.list(variables.tableId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.detail(variables.tableId, variables.reservationId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.all(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tables.detail(variables.tableId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tables.lists(),
      });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useMarkNoShow ────────────────────────────────────────────────────────────
// PATCH /tables/:id/reservations/:reservationId/noshow
export const useMarkNoShow = (
  options?: UseMutationOptions<
    ApiResponse<Reservation>,
    Error,
    { tableId: string; reservationId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ tableId, reservationId }: { tableId: string; reservationId: string }) =>
      markNoShowApi(tableId, reservationId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.list(variables.tableId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.detail(variables.tableId, variables.reservationId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reservations.all(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tables.detail(variables.tableId),
      });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};