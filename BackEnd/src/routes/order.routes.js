import express, { Router } from "express";

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

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// ═════════════════════════════════════════════════════════════════════════════
// RAZORPAY WEBHOOK
// ═════════════════════════════════════════════════════════════════════════════

router.post(
  "/webhook/razorpay",

  express.raw({
    type: "application/json",
  }),

  razorpayWebhook,
);

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// Create order
router.post("/", createOrder);

// Initiate Razorpay
router.post("/:orderId/initiate-payment", initiateRazorpayPayment);

// Verify Razorpay payment
router.post("/verify-payment", verifyRazorpayPayment);

// Confirm COD
router.post("/:orderId/cod-confirm", confirmCODOrder);

// ═════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// Get single order
router.get("/detail/:orderId", verifyJWT, getOrderById);

// Get all orders
router.get("/", verifyJWT, getAllOrders);

// Update order
router.patch("/:orderId/status", verifyJWT, updateOrderStatus);

export default router;
