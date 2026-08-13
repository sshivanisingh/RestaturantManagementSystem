import api from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateOrderPayload = {
  items: {
    menuItemId: string
    quantity  : number
  }[]
  deliveryInfo: {
    name   : string
    phone  : string
    email  : string
    address: string
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

export type UpdateOrderStatusPayload = {
  status: "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  note? : string
}

export type InitiatePaymentResponse = {
  razorpayOrderId: string
  amount         : number
  currency       : string
  paymentId      : string
  keyId          : string
}

export type OrderResponse = {
  order  : any
  payment: any
}

// ─── Step 1 — Create Order ────────────────────────────────────────────────────
export const createOrderApi = (
  restaurantId: string,
  payload: CreateOrderPayload
): Promise<ApiResponse<{ order: any; pricing: any }>> =>
  api.post(`/orders/${restaurantId}`, payload).then((r) => r.data);

// ─── Step 2A — Initiate Razorpay Payment ─────────────────────────────────────
export const initiateRazorpayPaymentApi = (
  orderId     : string,
  restaurantId: string
): Promise<ApiResponse<InitiatePaymentResponse>> =>
  api
    .post(`/orders/${orderId}/initiate-payment`, { restaurantId })
    .then((r) => r.data);

// ─── Step 2B — Verify Razorpay Payment ───────────────────────────────────────
export const verifyRazorpayPaymentApi = (
  payload: VerifyPaymentPayload
): Promise<ApiResponse<OrderResponse>> =>
  api.post("/orders/verify-payment", payload).then((r) => r.data);

// ─── Step 2C — COD Confirm ───────────────────────────────────────────────────
export const confirmCODOrderApi = (
  orderId     : string,
  restaurantId: string
): Promise<ApiResponse<OrderResponse>> =>
  api
    .post(`/orders/${orderId}/cod-confirm`, { restaurantId })
    .then((r) => r.data);

// ─── Get Single Order (customer) ─────────────────────────────────────────────
export const getOrderByIdApi = (
  orderId: string
): Promise<ApiResponse<any>> =>
  api.get(`/orders/detail/${orderId}`).then((r) => r.data);

// ─── Get All Orders (admin) ───────────────────────────────────────────────────
export const getAllOrdersApi = (
  params?: { status?: string; page?: number; limit?: number }
): Promise<ApiResponse<{ orders: any[]; total: number; page: number; totalPages: number }>> =>
  api.get(`/orders`, { params }).then((r) => r.data);

// ─── Update Order Status (admin) ──────────────────────────────────────────────
export const updateOrderStatusApi = (
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<ApiResponse<any>> =>
  api.patch(`/orders/${orderId}/status`, payload).then((r) => r.data);

// ─── Download Invoice (PDF) ───────────────────────────────────────────────────
export const downloadInvoiceApi = (
  orderId: string
): Promise<Blob> =>
  api.get(`/invoices/${orderId}/download`, { responseType: "blob" }).then((r) => r.data);