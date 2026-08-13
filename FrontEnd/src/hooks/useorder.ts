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
  CreateOrderPayload,
  VerifyPaymentPayload,
  UpdateOrderStatusPayload,
  InitiatePaymentResponse,
  OrderResponse,
} from "../api/order.api";
import {
  createOrderApi,
  initiateRazorpayPaymentApi,
  verifyRazorpayPaymentApi,
  confirmCODOrderApi,
  getOrderByIdApi,
  getAllOrdersApi,
  updateOrderStatusApi,
} from "../api/order.api";

// ═════════════════════════════════════════════════════════════════════════════
//  QUERIES
// ═════════════════════════════════════════════════════════════════════════════

// ─── Get All Orders — Admin ───────────────────────────────────────────────────
export const useGetAllOrders = (
  params?: { status?: string; page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<{ orders: any[]; total: number; page: number; totalPages: number }>>
) =>
  useQuery({
    queryKey: queryKeys.orders.lists(params?.status),
    queryFn : () => getAllOrdersApi(params),
    ...options,
  });

// ─── Get Single Order ─────────────────────────────────────────────────────────
export const useGetOrderById = (
  orderId: string,
  options?: UseQueryOptions<ApiResponse<any>>
) =>
  useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn : () => getOrderByIdApi(orderId),
    enabled : !!orderId,
    ...options,
  });

// ═════════════════════════════════════════════════════════════════════════════
//  MUTATIONS
// ═════════════════════════════════════════════════════════════════════════════

// ─── Step 1 — Create Order ────────────────────────────────────────────────────
export const useCreateOrder = (
  restaurantId: string,
  options?: UseMutationOptions<
    ApiResponse<{ order: any; pricing: any }>,
    Error,
    CreateOrderPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createOrderApi(restaurantId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(restaurantId) });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

// ─── Step 2A — Initiate Razorpay Payment ─────────────────────────────────────
export const useInitiateRazorpayPayment = (
  options?: UseMutationOptions<
    ApiResponse<InitiatePaymentResponse>,
    Error,
    { orderId: string; restaurantId: string }
  >
) =>
  useMutation({
    mutationFn: ({ orderId, restaurantId }) =>
      initiateRazorpayPaymentApi(orderId, restaurantId),
    ...options,
  });

// ─── Step 2B — Verify Razorpay Payment ───────────────────────────────────────
export const useVerifyRazorpayPayment = (
  restaurantId: string,
  options?: UseMutationOptions<
    ApiResponse<OrderResponse>,
    Error,
    VerifyPaymentPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyRazorpayPaymentApi,
    onSuccess: (data, variables, context) => {
      // Clear cart and refresh orders after successful payment
      queryClient.invalidateQueries({ queryKey: queryKeys.user.cart() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(restaurantId) });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

// ─── Step 2C — COD Confirm ───────────────────────────────────────────────────
export const useConfirmCODOrder = (
  restaurantId: string,
  options?: UseMutationOptions<
    ApiResponse<OrderResponse>,
    Error,
    { orderId: string; restaurantId: string }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, restaurantId: rid }) =>
      confirmCODOrderApi(orderId, rid),
    onSuccess: (data, variables, context) => {
      // Clear cart and refresh orders after COD confirmation
      queryClient.invalidateQueries({ queryKey: queryKeys.user.cart() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(restaurantId) });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

// ─── Update Order Status — Admin ──────────────────────────────────────────────
export const useUpdateOrderStatus = (
  restaurantId: string,
  options?: UseMutationOptions<
    ApiResponse<any>,
    Error,
    { orderId: string } & UpdateOrderStatusPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, ...payload }) =>
      updateOrderStatusApi(orderId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(restaurantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};