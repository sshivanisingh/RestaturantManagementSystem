import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { OrderService } from "../services/Order.service.js";

 
const createOrder = asyncHandler(async (req, res) => {
  const result = await OrderService.createOrder(req.body);
  res.status(201).json(new ApiResponse(201, result, "Order created"));
});




const initiateRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId }      = req.params;
  const result = await OrderService.initiateRazorpayPayment(orderId);
  res.status(200).json(new ApiResponse(200, result, "Razorpay order created"));
});

 
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const result = await OrderService.verifyRazorpayPayment(req.body);
  res.status(200).json(new ApiResponse(200, result, "Payment verified successfully"));
});

// ─── STEP 2C — COD Confirm ───────────────────────────────────────────────────
 
const confirmCODOrder = asyncHandler(async (req, res) => {
  const { orderId }      = req.params;
  const result = await OrderService.confirmCODOrder(orderId);
  res.status(200).json(new ApiResponse(200, result, "COD order confirmed"));
});

// ─── Update Order Status (admin) ──────────────────────────────────────────────
// PATCH /api/orders/:orderId/status
// Body: { orderstatus?, deliverystatus?, note }
//
// orderstatus   valid values: "confirmed" | "cancelled"
// deliverystatus valid values: "pending" | "out_for_delivery" | "delivered"
//
// Examples:
//   Kitchen confirms  → { orderstatus: "confirmed" }
//   Delivery boy out  → { deliverystatus: "out_for_delivery" }
//   Food delivered    → { deliverystatus: "delivered" }
//   Cancel order      → { orderstatus: "cancelled" }
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId }                    = req.params;
  const { orderstatus, deliverystatus, note } = req.body;

  const result = await OrderService.updateOrderStatus(orderId, {
    orderstatus,
    deliverystatus,
    note,
  });

  res.status(200).json(new ApiResponse(200, result, "Order status updated"));
});

// ─── Get All Orders (admin) ───────────────────────────────────────────────────
 
const getAllOrders = asyncHandler(async (req, res) => {
  const result = await OrderService.getAllOrders(req.query);
  res.status(200).json(new ApiResponse(200, result, "Orders fetched"));
});

// ─── Get Single Order ─────────────────────────────────────────────────────────
 
const getOrderById = asyncHandler(async (req, res) => {
  const result = await OrderService.getOrderById(req.params.orderId);
  res.status(200).json(new ApiResponse(200, result, "Order fetched"));
});

// ─── Razorpay Webhook ─────────────────────────────────────────────────────────
const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const result    = await OrderService.handleRazorpayWebhook(req.body, signature);
  res.status(200).json(result);
});

export {
  createOrder,
  initiateRazorpayPayment,
  verifyRazorpayPayment,
  confirmCODOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  razorpayWebhook,
};