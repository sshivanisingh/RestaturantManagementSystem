import api from "./axiosInstance";
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

export const registerDeliveryBoyApi = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleType?: "bike" | "bicycle" | "scooter" | "car";
  vehicleNumber?: string;
}): Promise<ApiResponse<DeliveryBoy>> =>
  api.post<ApiResponse<DeliveryBoy>>("/delivery/register", data).then((r) => r.data);

export const loginDeliveryBoyApi = (data: {
  email: string;
  password: string;
}): Promise<ApiResponse<DeliveryBoyLoginResponse>> =>
  api.post<ApiResponse<DeliveryBoyLoginResponse>>("/delivery/login", data).then((r) => r.data);

export const logoutDeliveryBoyApi = (): Promise<ApiResponse<null>> =>
  api.post<ApiResponse<null>>("/delivery/logout").then((r) => r.data);

export const refreshDeliveryBoyTokenApi = (
  refreshToken?: string
): Promise<ApiResponse<TokenResponse>> =>
  api
    .post<ApiResponse<TokenResponse>>("/delivery/refresh-token", { refreshToken })
    .then((r) => r.data);

// ═════════════════════════════════════════════════════════════════════════════
//  PROFILE
// ═════════════════════════════════════════════════════════════════════════════

export const getDeliveryBoyProfileApi = (): Promise<ApiResponse<DeliveryBoy>> =>
  api.get<ApiResponse<DeliveryBoy>>("/delivery/profile").then((r) => r.data);

export const updateDeliveryBoyProfileApi = (data: {
  name?: string;
  phone?: string;
  vehicleType?: "bike" | "bicycle" | "scooter" | "car";
  vehicleNumber?: string;
}): Promise<ApiResponse<DeliveryBoy>> =>
  api.patch<ApiResponse<DeliveryBoy>>("/delivery/profile", data).then((r) => r.data);

export const changeDeliveryBoyPasswordApi = (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<ApiResponse<{ message: string }>> =>
  api
    .patch<ApiResponse<{ message: string }>>("/delivery/change-password", data)
    .then((r) => r.data);

// ═════════════════════════════════════════════════════════════════════════════
//  STATUS & LOCATION
// ═════════════════════════════════════════════════════════════════════════════

export const toggleDeliveryBoyOnlineStatusApi = (
  isOnline: boolean
): Promise<ApiResponse<DeliveryBoy>> =>
  api
    .patch<ApiResponse<DeliveryBoy>>("/delivery/online-status", { isOnline })
    .then((r) => r.data);

export const updateDeliveryBoyLocationApi = (data: {
  latitude: number;
  longitude: number;
}): Promise<ApiResponse<DeliveryBoy>> =>
  api.patch<ApiResponse<DeliveryBoy>>("/delivery/location", data).then((r) => r.data);

// ═════════════════════════════════════════════════════════════════════════════
//  ORDERS (Delivery Boy)
// ═════════════════════════════════════════════════════════════════════════════

export const getAvailableOrdersApi = (): Promise<ApiResponse<AvailableOrder[]>> =>
  api.get<ApiResponse<AvailableOrder[]>>("/delivery/available-orders").then((r) => r.data);

export const acceptOrderApi = (orderId: string): Promise<ApiResponse<Order>> =>
  api.post<ApiResponse<Order>>(`/delivery/orders/${orderId}/accept`).then((r) => r.data);

export const updateDeliveryStatusApi = (
  orderId: string,
  data: { deliverystatus: "out_for_delivery" | "delivered"; note?: string }
): Promise<ApiResponse<Order>> =>
  api.patch<ApiResponse<Order>>(`/delivery/orders/${orderId}/status`, data).then((r) => r.data);

export const getCurrentOrderApi = (): Promise<
  ApiResponse<{ order: Order | null; message?: string }>
> =>
  api
    .get<ApiResponse<{ order: Order | null; message?: string }>>("/delivery/current-order")
    .then((r) => r.data);

export const getDeliveryBoyOrderHistoryApi = (params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PaginatedResponse<OrderHistory>>> =>
  api
    .get<ApiResponse<PaginatedResponse<OrderHistory>>>("/delivery/order-history", { params })
    .then((r) => r.data);

// ═════════════════════════════════════════════════════════════════════════════
//  CUSTOMER — Track delivery
// ═════════════════════════════════════════════════════════════════════════════

export const trackDeliveryBoyApi = (orderId: string): Promise<ApiResponse<DeliveryBoyLocation>> =>
  api.get<ApiResponse<DeliveryBoyLocation>>(`/delivery/track/${orderId}`).then((r) => r.data);

export const rateDeliveryApi = (
  orderId: string,
  data: { rating: number; comment?: string }
): Promise<ApiResponse<{ message: string }>> =>
  api
    .post<ApiResponse<{ message: string }>>(`/delivery/orders/${orderId}/rate`, data)
    .then((r) => r.data);

// ═════════════════════════════════════════════════════════════════════════════
//  ADMIN
// ═════════════════════════════════════════════════════════════════════════════

export const getAllDeliveryBoysApi = (params?: {
  page?: number;
  limit?: number;
  isOnline?: boolean;
}): Promise<ApiResponse<PaginatedResponse<DeliveryBoy>>> =>
  api
    .get<ApiResponse<PaginatedResponse<DeliveryBoy>>>("/delivery/admin/restaurants/boys", { params })
    .then((r) => r.data);

export const approveDeliveryBoyApi = (
  deliveryBoyId: string,
  data: { isApproved?: boolean; isActive?: boolean }
): Promise<ApiResponse<DeliveryBoy>> =>
  api
    .patch<ApiResponse<DeliveryBoy>>(`/delivery/admin/boys/${deliveryBoyId}/approve`, data)
    .then((r) => r.data);

export const assignDeliveryBoyApi = (
  orderId: string,
  deliveryBoyId: string
): Promise<ApiResponse<Order>> =>
  api
    .post<ApiResponse<Order>>(`/delivery/admin/orders/${orderId}/assign`, { deliveryBoyId })
    .then((r) => r.data);