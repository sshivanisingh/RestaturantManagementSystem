import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  toggleOnlineStatus,
  updateLocation,
  getAvailableOrders,
  acceptOrder,
  updateDeliveryStatus,
  getCurrentOrder,
  getOrderHistory,
  getMyEarnings,
  trackDeliveryBoy,
  rateDelivery,
  getAllDeliveryBoys,
  approveDeliveryBoy,
  assignDeliveryBoy,
} from "../controllers/deliveryboy.controller.js";


import { verifyDeliveryBoyJWT } from "../middleware/deliveryboy.middleware.js";
import { verifyJWT }            from "../middleware/auth.middleware.js";   // user auth

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES (no auth needed)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/delivery/restaurants/:restaurantId/register
router.post("/register", register);

// POST /api/delivery/login
router.post("/login", login);

// POST /api/delivery/refresh-token
router.post("/refresh-token", refreshToken);

// ═══════════════════════════════════════════════════════════════════════════
//  DELIVERY BOY PROTECTED ROUTES
// ═══════════════════════════════════════════════════════════════════════════
// router.use(verifyDeliveryBoyJWT); // apply to all routes below

// ── Auth ────────────────────────────────────────────────────────────────────
router.post("/logout", verifyDeliveryBoyJWT, logout);

// ── Profile ─────────────────────────────────────────────────────────────────
router.get ("/profile",     verifyDeliveryBoyJWT,    getProfile);
router.patch("/profile",     verifyDeliveryBoyJWT,   updateProfile);
router.patch("/change-password",verifyDeliveryBoyJWT, changePassword);

// ── Online Status & Location ─────────────────────────────────────────────────
// PATCH /api/delivery/online-status    body: { isOnline: true|false }
router.patch("/online-status",verifyDeliveryBoyJWT, toggleOnlineStatus);

// PATCH /api/delivery/location         body: { latitude, longitude }
// Frontend calls this every 5–10 seconds when delivery boy has an active order
router.patch("/location",verifyDeliveryBoyJWT, updateLocation);

// ── Orders ───────────────────────────────────────────────────────────────────
// GET  /api/delivery/available-orders  — see all unassigned orders
router.get("/available-orders",verifyDeliveryBoyJWT, getAvailableOrders);

// GET  /api/delivery/current-order     — see current active order + customer location
router.get("/current-order",verifyDeliveryBoyJWT, getCurrentOrder);

// GET  /api/delivery/order-history     — past delivered orders
router.get("/order-history",verifyDeliveryBoyJWT, getOrderHistory);

// GET  /api/delivery/earnings          — earnings breakdown
router.get("/earnings",verifyDeliveryBoyJWT, getMyEarnings);

// POST /api/delivery/orders/:orderId/accept
router.post("/orders/:orderId/accept",verifyDeliveryBoyJWT, acceptOrder);

// PATCH /api/delivery/orders/:orderId/status   body: { deliverystatus, note? }
router.patch("/orders/:orderId/status",verifyDeliveryBoyJWT, updateDeliveryStatus);

// ═══════════════════════════════════════════════════════════════════════════
//  CUSTOMER ROUTES (verifyJWT — user auth middleware lagao)
// ═══════════════════════════════════════════════════════════════════════════

// GET  /api/delivery/track/:orderId
// Customer tracks live location of delivery boy
router.get("/track/:orderId", verifyJWT, trackDeliveryBoy);

// POST /api/delivery/orders/:orderId/rate
// body: { rating: 1-5, comment? }
router.post("/orders/:orderId/rate", verifyJWT, rateDelivery);

// ═══════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES (restaurant/admin auth required)
// ═══════════════════════════════════════════════════════════════════════════

// GET  /api/delivery/admin/restaurants/:restaurantId/boys
router.get("/admin/restaurants/boys", verifyJWT, getAllDeliveryBoys);

// PATCH /api/delivery/admin/boys/:deliveryBoyId/approve
// body: { isApproved?: boolean, isActive?: boolean }
router.patch("/admin/boys/:deliveryBoyId/approve", verifyJWT, approveDeliveryBoy);

// POST /api/delivery/admin/orders/:orderId/assign
// body: { deliveryBoyId }
router.post("/admin/orders/:orderId/assign", verifyJWT, assignDeliveryBoy);

export default router;