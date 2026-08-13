import api from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserLoginPayload       = { email: string; password: string }
export type ActivateAccountPayload = { token: string; newPassword: string }
export type UpdateProfilePayload   = { name?: string; phone?: string; addresses?: any[] }
export type AddToCartPayload       = { menuItemId: string; quantity?: number }
export type UpdateCartPayload      = { menuItemId: string; quantity: number }
export type ToggleWishlistPayload  = { menuItemId: string }

export type CreateOrderPayload = {
  items        : { menuItemId: string; quantity: number }[]
  deliveryInfo : {
    name   : string
    phone  : string
    email  : string
    street : string
    city   : string
    state? : string
    pincode: string
    type   : "delivery" | "pickup"
  }
  paymentMethod: "COD" | "RAZORPAY"
  couponCode?  : string
  notes?       : string
}

export type VerifyPaymentPayload = {
  razorpay_order_id  : string
  razorpay_payment_id: string
  razorpay_signature : string
  paymentId          : string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const userLoginApi = (
  payload: UserLoginPayload
): Promise<ApiResponse<{ user: any; accessToken: string }>> =>
  api.post("/user/login", payload).then((r) => r.data);

  
export const userLogoutApi = (): Promise<ApiResponse<null>> =>
  api.post("/user/logout").then((r) => r.data);

export const activateAccountApi = (
  payload: ActivateAccountPayload
): Promise<ApiResponse<{ message: string }>> =>
  api.post("/user/activate-account", payload).then((r) => r.data);

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getUserProfileApi = (): Promise<ApiResponse<any>> =>
  api.get("/user/profile").then((r) => r.data);

export const updateUserProfileApi = (
  payload: UpdateProfilePayload
): Promise<ApiResponse<any>> =>
  api.patch("/user/profile", payload).then((r) => r.data);

export const changeUserPasswordApi = (payload: {
  currentPassword: string; newPassword: string
}): Promise<ApiResponse<{ message: string }>> =>
  api.patch("/user/change-password", payload).then((r) => r.data);

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const getCartApi = (): Promise<ApiResponse<any[]>> =>
  api.get("/user/cart").then((r) => r.data);

export const addToCartApi = (
  payload: AddToCartPayload
): Promise<ApiResponse<any[]>> =>
  api.post("/user/cart", payload).then((r) => r.data);

export const updateCartItemApi = (
  payload: UpdateCartPayload
): Promise<ApiResponse<any[]>> =>
  api.patch("/user/cart", payload).then((r) => r.data);

export const removeFromCartApi = (
  menuItemId: string
): Promise<ApiResponse<any[]>> =>
  api.delete(`/user/cart/${menuItemId}`).then((r) => r.data);

export const clearCartApi = (): Promise<ApiResponse<{ message: string }>> =>
  api.delete("/user/cart").then((r) => r.data);

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const getWishlistApi = (): Promise<ApiResponse<any[]>> =>
  api.get("/user/wishlist").then((r) => r.data);

export const toggleWishlistApi = (
  payload: ToggleWishlistPayload
): Promise<ApiResponse<{ message: string; action: "added" | "removed" }>> =>
  api.post("/user/wishlist/toggle", payload).then((r) => r.data);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const getMyOrdersApi = (): Promise<ApiResponse<any[]>> =>
  api.get("/user/orders").then((r) => r.data);

// Step 1 — Order create
export const createOrderApi = (
  payload: CreateOrderPayload
): Promise<ApiResponse<{ order: any; pricing: any }>> =>
  {
    return api.post(`/orders/`, payload).then((r) => r.data);
  };

// Step 2A — Razorpay order initiate
export const initiateRazorpayPaymentApi = (
  orderId: string,
): Promise<ApiResponse<{
  razorpayOrderId: string
  amount         : number
  currency       : string
  paymentId      : string
  keyId          : string
}>> =>
  api.post(`/orders/${orderId}/initiate-payment`).then((r) => r.data);

// Step 2B — Razorpay verify
export const verifyRazorpayPaymentApi = (
  payload: VerifyPaymentPayload
): Promise<ApiResponse<{ order: any; payment: any }>> =>
  api.post("/orders/verify-payment", payload).then((r) => r.data);

// Step 2C — COD confirm
export const confirmCODOrderApi = (
  orderId: string,
  restaurantId: string
): Promise<ApiResponse<{ order: any; payment: any }>> =>
  api.post(`/orders/${orderId}/cod-confirm`, { restaurantId }).then((r) => r.data);