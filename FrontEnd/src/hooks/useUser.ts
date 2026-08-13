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
  UserLoginPayload,
  ActivateAccountPayload,
  UpdateProfilePayload,
  AddToCartPayload,
  UpdateCartPayload,
  ToggleWishlistPayload,
  CreateOrderPayload,
  VerifyPaymentPayload,
} from "../api/user.api";
import {
  userLoginApi,
  userLogoutApi,
  activateAccountApi,
  getUserProfileApi,
  updateUserProfileApi,
  changeUserPasswordApi,
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
  getWishlistApi,
  toggleWishlistApi,
  getMyOrdersApi,
  createOrderApi,
  initiateRazorpayPaymentApi,
  verifyRazorpayPaymentApi,
  confirmCODOrderApi,
} from "../api/user.api";

// ═════════════════════════════════════════════════════════════════════════════
//  AUTH
// ═════════════════════════════════════════════════════════════════════════════

export const useUserLogin = (
  options?: UseMutationOptions<ApiResponse<{ user: any; accessToken: string }>, Error, UserLoginPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLoginApi,
    onSuccess: (data, variables, context) => {
      // Persist access token and refresh user profile cache
      localStorage.setItem("accessToken", data.data.accessToken);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

export const useUserLogout = (
  options?: UseMutationOptions<ApiResponse<null>, Error, void>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLogoutApi,
    onSuccess: (data, variables, context) => {
      // Remove token and clear all user-related caches on logout
      localStorage.removeItem("accessToken");
      queryClient.removeQueries({ queryKey: queryKeys.user.profile() });
      queryClient.removeQueries({ queryKey: queryKeys.user.cart() });
      queryClient.removeQueries({ queryKey: queryKeys.user.wishlist() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

export const useActivateAccount = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, ActivateAccountPayload>
) =>
  useMutation({
    mutationFn: activateAccountApi,
    ...options,
  });

// ═════════════════════════════════════════════════════════════════════════════
//  PROFILE
// ═════════════════════════════════════════════════════════════════════════════

export const useGetUserProfile = (
  options?: UseQueryOptions<ApiResponse<any>>
) =>
  useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn : getUserProfileApi,
    ...options,
  });

export const useUpdateUserProfile = (
  options?: UseMutationOptions<ApiResponse<any>, Error, UpdateProfilePayload>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserProfileApi,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

export const useChangeUserPassword = (
  options?: UseMutationOptions<ApiResponse<any>, Error, { currentPassword: string; newPassword: string }>
) =>
  useMutation({
    mutationFn: changeUserPasswordApi,
    ...options,
  });

// ═════════════════════════════════════════════════════════════════════════════
//  CART
// ═════════════════════════════════════════════════════════════════════════════

export const useGetCart = (
  options?: UseQueryOptions<ApiResponse<any[]>>
) =>
  useQuery({
    queryKey: queryKeys.user.cart(),
    queryFn : getCartApi,
    ...options,
  });

export const useAddToCart = (
  options?: UseMutationOptions<ApiResponse<any[]>, Error, AddToCartPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToCartApi,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.cart() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

export const useUpdateCartItem = (
  options?: UseMutationOptions<ApiResponse<any[]>, Error, UpdateCartPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCartItemApi,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.cart() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

export const useRemoveFromCart = (
  options?: UseMutationOptions<ApiResponse<any[]>, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromCartApi,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.cart() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

export const useClearCart = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, void>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearCartApi,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.cart() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

// ═════════════════════════════════════════════════════════════════════════════
//  WISHLIST
// ═════════════════════════════════════════════════════════════════════════════

export const useGetWishlist = (
  options?: Omit<UseQueryOptions<ApiResponse<any[]>>, "queryKey" | "queryFn">
) =>
  useQuery({
    queryKey: queryKeys.user.wishlist(),
    queryFn : getWishlistApi,
    ...options,
  });

export const useToggleWishlist = (
  options?: UseMutationOptions<
    ApiResponse<{ message: string; action: "added" | "removed" }>,
    Error,
    ToggleWishlistPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleWishlistApi,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.wishlist() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

// ═════════════════════════════════════════════════════════════════════════════
//  ORDERS
// ═════════════════════════════════════════════════════════════════════════════

export const useGetMyOrders = (
  options?: UseQueryOptions<ApiResponse<any[]>>
) =>
  useQuery({
    queryKey: queryKeys.user.orders(),
    queryFn : getMyOrdersApi,
    ...options,
  });

// ─── Step 1 — Create Order ────────────────────────────────────────────────────
export const useCreateOrder = (
  options?: UseMutationOptions<
    ApiResponse<{ order: any; pricing: any }>,
    Error,
    CreateOrderPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createOrderApi(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

 
export const useInitiateRazorpayPayment = (
  options?: UseMutationOptions<
    ApiResponse<{ razorpayOrderId: string; amount: number; currency: string; paymentId: string; keyId: string }>,
    Error,
    { orderId: string; restaurantId: string }
  >
) =>
  useMutation({
    mutationFn: ({ orderId}) =>
      initiateRazorpayPaymentApi(orderId),
    ...options,
  });

// ─── Step 2B — Verify Razorpay Payment ───────────────────────────────────────
export const useVerifyRazorpayPayment = (
  options?: UseMutationOptions<
    ApiResponse<{ order: any; payment: any }>,
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
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

// ─── Step 2C — COD Confirm ───────────────────────────────────────────────────
export const useConfirmCODOrder = (
  options?: UseMutationOptions<
    ApiResponse<{ order: any; payment: any }>,
    Error,
    { orderId: string; restaurantId: string }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, restaurantId }) =>
      confirmCODOrderApi(orderId, restaurantId),
    onSuccess: (data, variables, context) => {
      // Clear cart and refresh orders after COD confirmation
      queryClient.invalidateQueries({ queryKey: queryKeys.user.cart() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};