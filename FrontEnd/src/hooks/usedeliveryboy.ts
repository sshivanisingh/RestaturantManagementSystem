import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  registerDeliveryBoyApi,
  loginDeliveryBoyApi,
  logoutDeliveryBoyApi,
  refreshDeliveryBoyTokenApi,
  getDeliveryBoyProfileApi,
  updateDeliveryBoyProfileApi,
  changeDeliveryBoyPasswordApi,
  toggleDeliveryBoyOnlineStatusApi,
  updateDeliveryBoyLocationApi,
  getAvailableOrdersApi,
  acceptOrderApi,
  updateDeliveryStatusApi,
  getCurrentOrderApi,
  getDeliveryBoyOrderHistoryApi,
  trackDeliveryBoyApi,
  rateDeliveryApi,
  getAllDeliveryBoysApi,
  approveDeliveryBoyApi,
  assignDeliveryBoyApi,
} from "../api/deliveryboy.api";
import { queryKeys } from "../api/queryKeys";
import type {
  ApiResponse,
  DeliveryBoy,
  DeliveryBoyLoginResponse,
  TokenResponse,
  Order,
  DeliveryBoyLocation,
  AvailableOrder,
  OrderHistory,
  PaginatedResponse,
} from "../types/api.types";

// ═════════════════════════════════════════════════════════════════════════════
//  AUTH
// ═════════════════════════════════════════════════════════════════════════════

// ─── useRegisterDeliveryBoy ───────────────────────────────────────────────────
export const useRegisterDeliveryBoy = (
  options?: UseMutationOptions<
    ApiResponse<DeliveryBoy>,
    Error,
    Parameters<typeof registerDeliveryBoyApi>[0]
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: registerDeliveryBoyApi,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.list() });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useLoginDeliveryBoy ──────────────────────────────────────────────────────
export const useLoginDeliveryBoy = (
  options?: UseMutationOptions<
    ApiResponse<DeliveryBoyLoginResponse>,
    Error,
    { email: string; password: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: loginDeliveryBoyApi,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.profile() });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useLogoutDeliveryBoy ─────────────────────────────────────────────────────
export const useLogoutDeliveryBoy = (
  options?: UseMutationOptions<ApiResponse<null>, Error, void>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: logoutDeliveryBoyApi,
    onSuccess: async (data, variables, context) => {
      queryClient.removeQueries({ queryKey: ["deliveryBoy"] });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useRefreshDeliveryBoyToken ───────────────────────────────────────────────
export const useRefreshDeliveryBoyToken = (
  options?: UseMutationOptions<ApiResponse<TokenResponse>, Error, string | undefined>
) =>
  useMutation({
    mutationFn: (refreshToken) => refreshDeliveryBoyTokenApi(refreshToken),
    ...options,
  });

// ═════════════════════════════════════════════════════════════════════════════
//  PROFILE
// ═════════════════════════════════════════════════════════════════════════════

// ─── useGetDeliveryBoyProfile ─────────────────────────────────────────────────
export const useGetDeliveryBoyProfile = (
  options?: Omit<
    UseQueryOptions<ApiResponse<DeliveryBoy>, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: queryKeys.deliveryBoy.profile(),
    queryFn : getDeliveryBoyProfileApi,
    ...options,
  });

// ─── useUpdateDeliveryBoyProfile ──────────────────────────────────────────────
export const useUpdateDeliveryBoyProfile = (
  options?: UseMutationOptions<
    ApiResponse<DeliveryBoy>,
    Error,
    Parameters<typeof updateDeliveryBoyProfileApi>[0]
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: updateDeliveryBoyProfileApi,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.profile() });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useChangeDeliveryBoyPassword ─────────────────────────────────────────────
export const useChangeDeliveryBoyPassword = (
  options?: UseMutationOptions<
    ApiResponse<{ message: string }>,
    Error,
    { oldPassword: string; newPassword: string }
  >
) =>
  useMutation({
    mutationFn: changeDeliveryBoyPasswordApi,
    ...options,
  });

// ═════════════════════════════════════════════════════════════════════════════
//  STATUS & LOCATION
// ═════════════════════════════════════════════════════════════════════════════

// ─── useToggleDeliveryBoyOnlineStatus ─────────────────────────────────────────
export const useToggleDeliveryBoyOnlineStatus = (
  options?: UseMutationOptions<ApiResponse<DeliveryBoy>, Error, boolean>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: toggleDeliveryBoyOnlineStatusApi,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.profile() });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useUpdateDeliveryBoyLocation ─────────────────────────────────────────────
// Fire and forget — no cache invalidation needed
export const useUpdateDeliveryBoyLocation = (
  options?: UseMutationOptions<
    ApiResponse<DeliveryBoy>,
    Error,
    { latitude: number; longitude: number }
  >
) =>
  useMutation({
    mutationFn: updateDeliveryBoyLocationApi,
    ...options,
  });

// ═════════════════════════════════════════════════════════════════════════════
//  ORDERS (Delivery Boy)
// ═════════════════════════════════════════════════════════════════════════════

// ─── useGetAvailableOrders ────────────────────────────────────────────────────
export const useGetAvailableOrders = (
  options?: Omit<
    UseQueryOptions<ApiResponse<AvailableOrder[]>, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey : queryKeys.deliveryBoy.availableOrders(),
    queryFn  : getAvailableOrdersApi,
    staleTime: 10_000,
    ...options,
  });

// ─── useAcceptOrder ───────────────────────────────────────────────────────────
export const useAcceptOrder = (
  options?: UseMutationOptions<ApiResponse<Order>, Error, string>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: acceptOrderApi,
    onSuccess: async (data, orderId, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.availableOrders() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.currentOrder() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.profile() });
      onSuccess?.(data, orderId, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useUpdateDeliveryStatus ──────────────────────────────────────────────────
export const useUpdateDeliveryStatus = (
  options?: UseMutationOptions<
    ApiResponse<Order>,
    Error,
    { orderId: string; deliverystatus: "out_for_delivery" | "delivered"; note?: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ orderId, ...data }) => updateDeliveryStatusApi(orderId, data),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.currentOrder() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.profile() });
      if (variables.deliverystatus === "delivered") {
        await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.history() });
      }
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useGetCurrentOrder ───────────────────────────────────────────────────────
export const useGetCurrentOrder = (
  options?: Omit<
    UseQueryOptions<ApiResponse<{ order: Order | null; message?: string }>, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey : queryKeys.deliveryBoy.currentOrder(),
    queryFn  : getCurrentOrderApi,
    staleTime: 15_000,
    ...options,
  });

// ─── useGetDeliveryBoyOrderHistory ────────────────────────────────────────────
export const useGetDeliveryBoyOrderHistory = (
  params?: { page?: number; limit?: number },
  options?: Omit<
    UseQueryOptions<ApiResponse<PaginatedResponse<OrderHistory>>, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: queryKeys.deliveryBoy.history(params?.page),
    queryFn : () => getDeliveryBoyOrderHistoryApi(params),
    ...options,
  });

// ═════════════════════════════════════════════════════════════════════════════
//  CUSTOMER — Track delivery
// ═════════════════════════════════════════════════════════════════════════════

// ─── useTrackDeliveryBoy ──────────────────────────────────────────────────────
// Auto-polls every 10s for live location
export const useTrackDeliveryBoy = (
  orderId: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<DeliveryBoyLocation>, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey       : queryKeys.deliveryBoy.location(orderId),
    queryFn        : () => trackDeliveryBoyApi(orderId),
    enabled        : !!orderId,
    staleTime      : 0,
    refetchInterval: 10_000,
    ...options,
  });

// ─── useRateDelivery ──────────────────────────────────────────────────────────
export const useRateDelivery = (
  options?: UseMutationOptions<
    ApiResponse<{ message: string }>,
    Error,
    { orderId: string; rating: number; comment?: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ orderId, ...data }) => rateDeliveryApi(orderId, data),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.order(variables.orderId) });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ═════════════════════════════════════════════════════════════════════════════
//  ADMIN
// ═════════════════════════════════════════════════════════════════════════════

// ─── useGetAllDeliveryBoys ────────────────────────────────────────────────────
export const useGetAllDeliveryBoys = (
  params?: { page?: number; limit?: number; isOnline?: boolean },
  options?: Omit<
    UseQueryOptions<ApiResponse<PaginatedResponse<DeliveryBoy>>, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: queryKeys.deliveryBoy.list(params),
    queryFn : () => getAllDeliveryBoysApi(params),
    ...options,
  });

// ─── useApproveDeliveryBoy ────────────────────────────────────────────────────
export const useApproveDeliveryBoy = (
  options?: UseMutationOptions<
    ApiResponse<DeliveryBoy>,
    Error,
    { deliveryBoyId: string; isApproved?: boolean; isActive?: boolean }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ deliveryBoyId, ...data }) => approveDeliveryBoyApi(deliveryBoyId, data),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.list() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.detail(variables.deliveryBoyId) });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};

// ─── useAssignDeliveryBoy ─────────────────────────────────────────────────────
export const useAssignDeliveryBoy = (
  options?: UseMutationOptions<
    ApiResponse<Order>,
    Error,
    { orderId: string; deliveryBoyId: string }
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ orderId, deliveryBoyId }) => assignDeliveryBoyApi(orderId, deliveryBoyId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.list() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.deliveryBoy.detail(variables.deliveryBoyId) });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError,
    onSettled,
    ...restOptions,
  });
};