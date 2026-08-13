import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DashboardService } from "../services/DashboardService.js";

// GET /api/dashboard
// Full dashboard with all stats
const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await DashboardService.getFullDashboard();
  res.status(200).json(new ApiResponse(200, dashboard, "Dashboard stats fetched"));
});

// GET /api/dashboard/overview
// Overview stats: total orders, revenue, pending orders
const getOverview = asyncHandler(async (req, res) => {
  const overview = await DashboardService.getOverviewStats();
  res.status(200).json(new ApiResponse(200, overview, "Overview fetched"));
});

// GET /api/dashboard/revenue
// Revenue chart data for last N days
// Query: ?days=30
const getRevenue = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const revenue = await DashboardService.getRevenueChart(Number(days));
  res.status(200).json(new ApiResponse(200, revenue, "Revenue chart fetched"));
});

// GET /api/dashboard/top-items
// Top selling menu items
// Query: ?limit=10
const getTopItems = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const items = await DashboardService.getTopItems(Number(limit));
  res.status(200).json(new ApiResponse(200, items, "Top items fetched"));
});

// GET /api/dashboard/order-status
// Order status distribution
const getOrderStatus = asyncHandler(async (req, res) => {
  const statuses = await DashboardService.getOrderStatus();
  res.status(200).json(new ApiResponse(200, statuses, "Order status fetched"));
});

// GET /api/dashboard/delivery
// Delivery statistics
const getDelivery = asyncHandler(async (req, res) => {
  const delivery = await DashboardService.getDeliveryStats();
  res.status(200).json(new ApiResponse(200, delivery, "Delivery stats fetched"));
});

// GET /api/dashboard/tables
// Table occupancy stats
const getTables = asyncHandler(async (req, res) => {
  const tables = await DashboardService.getActiveTables();
  res.status(200).json(new ApiResponse(200, tables, "Table stats fetched"));
});

// GET /api/dashboard/customers
// Customer statistics
const getCustomers = asyncHandler(async (req, res) => {
  const customers = await DashboardService.getCustomerStats();
  res.status(200).json(new ApiResponse(200, customers, "Customer stats fetched"));
});

export {
  getDashboard,
  getOverview,
  getRevenue,
  getTopItems,
  getOrderStatus,
  getDelivery,
  getTables,
  getCustomers,
};
