import api from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";

export const getOverviewApi = (): Promise<ApiResponse<{
  totalOrders: number; confirmedOrders: number; pendingOrders: number;
  totalRevenue: number; todayRevenue: number;
}>> => api.get("/dashboard/overview").then((r) => r.data);

export const getRevenueChartApi = (days = 30): Promise<ApiResponse<
  { date: string; revenue: number; orders: number }[]
>> => api.get("/dashboard/revenue", { params: { days } }).then((r) => r.data);

export const getTopItemsApi = (limit = 10): Promise<ApiResponse<
  { itemId: string; itemName: string; quantity: number; revenue: number }[]
>> => api.get("/dashboard/top-items", { params: { limit } }).then((r) => r.data);

export const getOrderStatusApi = (): Promise<ApiResponse<
  { status: string; count: number }[]
>> => api.get("/dashboard/order-status").then((r) => r.data);

export const getDeliveryStatsApi = (): Promise<ApiResponse<{
  totalDeliveries: number; deliveredCount: number;
  pendingDeliveries: number; deliveryRate: number | string;
}>> => api.get("/dashboard/delivery").then((r) => r.data);

export const getCustomerStatsApi = (): Promise<ApiResponse<{
  totalCustomers: number; activeCustomers: number; inactiveCustomers: number;
}>> => api.get("/dashboard/customers").then((r) => r.data);

export const getFullDashboardApi = (): Promise<ApiResponse<any>> =>
  api.get("/dashboard").then((r) => r.data);
