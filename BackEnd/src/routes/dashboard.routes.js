import { Router } from "express";
import {
  getDashboard,
  getOverview,
  getRevenue,
  getTopItems,
  getOrderStatus,
  getDelivery,
  getTables,
  getCustomers,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All dashboard routes require authentication (admin only)
router.use(verifyJWT);

// GET /api/dashboard
// Full dashboard with all stats
router.get("/", getDashboard);

// GET /api/dashboard/overview
// Overview stats
router.get("/overview", getOverview);

// GET /api/dashboard/revenue
// Revenue chart for last N days (query: ?days=30)
router.get("/revenue", getRevenue);

// GET /api/dashboard/top-items
// Top selling items (query: ?limit=10)
router.get("/top-items", getTopItems);

// GET /api/dashboard/order-status
// Order status distribution
router.get("/order-status", getOrderStatus);

// GET /api/dashboard/delivery
// Delivery statistics
router.get("/delivery", getDelivery);

// GET /api/dashboard/tables
// Table occupancy stats
router.get("/tables", getTables);

// GET /api/dashboard/customers
// Customer statistics
router.get("/customers", getCustomers);

export default router;
