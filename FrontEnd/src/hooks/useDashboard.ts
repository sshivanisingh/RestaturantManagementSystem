import { useQuery } from "@tanstack/react-query";
import {
  getOverviewApi,
  getRevenueChartApi,
  getTopItemsApi,
  getOrderStatusApi,
  getDeliveryStatsApi,
  getCustomerStatsApi,
  getFullDashboardApi,
} from "../api/dashboard.api";

export const useGetDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn:  () => getOverviewApi(),
  });

export const useGetRevenueChart = (days: number = 30) =>
  useQuery({
    queryKey: ["dashboard", "revenue", days],
    queryFn:  () => getRevenueChartApi(days),
  });

export const useGetTopSellingItems = (limit: number = 5) =>
  useQuery({
    queryKey: ["dashboard", "top-items", limit],
    queryFn:  () => getTopItemsApi(limit),
  });

export const useGetOrderStatusChart = () =>
  useQuery({
    queryKey: ["dashboard", "order-status"],
    queryFn:  () => getOrderStatusApi(),
  });

export const useGetDeliveryStats = () =>
  useQuery({
    queryKey: ["dashboard", "delivery"],
    queryFn:  () => getDeliveryStatsApi(),
  });

export const useGetCustomerStats = () =>
  useQuery({
    queryKey: ["dashboard", "customers"],
    queryFn:  () => getCustomerStatsApi(),
  });

export const useGetFullDashboard = () =>
  useQuery({
    queryKey: ["dashboard", "full"],
    queryFn:  () => getFullDashboardApi(),
  });
