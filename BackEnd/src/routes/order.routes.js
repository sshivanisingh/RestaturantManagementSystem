import express, { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  createOrder,
  initiateRazorpayPayment,
  verifyRazorpayPayment,
  confirmCODOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  razorpayWebhook,
} from "../controllers/order.controller.js";

const router = Router();

// ═════════════════════════════════════════════════════════════════════════════
// RAZORPAY WEBHOOK
// ═════════════════════════════════════════════════════════════════════════════
// IMPORTANT: This route must receive the raw request body for Razorpay
// signature verification. Do not put express.json() specifically on this route.

router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook,
);

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// Guests can place orders without logging in.
// ═════════════════════════════════════════════════════════════════════════════

// Create a new order
router.post("/", createOrder);

// Initiate Razorpay payment for an existing order
router.post("/:orderId/initiate-payment", initiateRazorpayPayment);

// Verify Razorpay payment
router.post("/verify-payment", verifyRazorpayPayment);

// Confirm Cash on Delivery order
router.post("/:orderId/cod-confirm", confirmCODOrder);

// ═════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// Get a specific order
router.get("/detail/:orderId", verifyJWT, getOrderById);

// Admin: get all restaurant orders
router.get("/", verifyJWT, getAllOrders);

// Admin: update order status
router.patch("/:orderId/status", verifyJWT, updateOrderStatus);

export default router;
