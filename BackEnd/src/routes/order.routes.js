import { Router }         from "express";
import { verifyJWT }      from "../middleware/auth.middleware.js";       
 
import express            from "express";
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

// ─── Webhook — raw body is required, JSON should NOT be parsed ─────────────────

router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// ═════════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES — Guests can also place orders
// ═════════════════════════════════════════════════════════════════════════════

// Step 1 — Create order (items + delivery information)
 

// Step 2A — Initiate Razorpay payment (returns Razorpay order ID)
router.post("/:orderId/initiate-payment", initiateRazorpayPayment);


// Step 2B — Verify payment (after Razorpay callback)
router.post("/verify-payment", verifyRazorpayPayment);

// Step 2C — Confirm Cash on Delivery (COD) order
router.post("/:orderId/cod-confirm", confirmCODOrder);

router.post("/", createOrder);

// ═════════════════════════════════════════════════════════════════════════════
//  PROTECTED — Customer routes
// ═════════════════════════════════════════════════════════════════════════════
router.get("/detail/:orderId", verifyJWT, getOrderById);

// ═════════════════════════════════════════════════════════════════════════════
//  PROTECTED — Admin (Restaurant) routes
// ═════════════════════════════════════════════════════════════════════════════
router.get("/", verifyJWT, getAllOrders);
router.patch("/:orderId/status", verifyJWT, updateOrderStatus);

export default router;