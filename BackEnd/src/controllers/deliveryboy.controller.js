import { asyncHandler }      from "../utils/asyncHandler.js";
import { ApiResponse }       from "../utils/ApiResponse.js";
import { DeliveryBoyService } from "../services/deliveryboy.service.js";

// ─── Cookie Options ───────────────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure  : process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// ═════════════════════════════════════════════════════════════════════════════
//  AUTH
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/delivery/register
// Body: { name, email, phone, password, vehicleType?, vehicleNumber? }
// Admin registers a new delivery boy for their restaurant
const register = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.register(req.body);
  res.status(201).json(new ApiResponse(201, result, "Delivery boy registered successfully"));
});

// POST /api/delivery/login
// Body: { email, password }
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await DeliveryBoyService.login(email, password);

  res
    .status(200)
    .cookie("deliveryAccessToken",  result.accessToken,  cookieOptions)
    .cookie("deliveryRefreshToken", result.refreshToken, cookieOptions)
    .json(new ApiResponse(200, result, "Login successful"));
});

// POST /api/delivery/logout
// Auth: delivery boy token required
const logout = asyncHandler(async (req, res) => {
  await DeliveryBoyService.logout(req.deliveryBoy._id);
  res
    .status(200)
    .clearCookie("deliveryAccessToken",  cookieOptions)
    .clearCookie("deliveryRefreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// POST /api/delivery/refresh-token
// Body: { refreshToken }  OR  cookie
const refreshToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.deliveryRefreshToken || req.body?.refreshToken;
  const result   = await DeliveryBoyService.refreshAccessToken(incoming);

  res
    .status(200)
    .cookie("deliveryAccessToken",  result.accessToken,  cookieOptions)
    .cookie("deliveryRefreshToken", result.refreshToken, cookieOptions)
    .json(new ApiResponse(200, result, "Token refreshed"));
});

// ═════════════════════════════════════════════════════════════════════════════
//  PROFILE
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/delivery/profile
const getProfile = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.getProfile(req.deliveryBoy._id);
  res.status(200).json(new ApiResponse(200, result, "Profile fetched"));
});

// PATCH /api/delivery/profile
// Body: { name?, phone?, vehicleType?, vehicleNumber? }
const updateProfile = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.updateProfile(req.deliveryBoy._id, req.body);
  res.status(200).json(new ApiResponse(200, result, "Profile updated"));
});

// PATCH /api/delivery/change-password
// Body: { oldPassword, newPassword }
const changePassword = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.changePassword(req.deliveryBoy._id, req.body);
  res.status(200).json(new ApiResponse(200, result, "Password changed"));
});

// ═════════════════════════════════════════════════════════════════════════════
//  STATUS & LOCATION
// ═════════════════════════════════════════════════════════════════════════════

// PATCH /api/delivery/online-status
// Body: { isOnline: true | false }
const toggleOnlineStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  const result = await DeliveryBoyService.toggleOnlineStatus(req.deliveryBoy._id, isOnline);
  res.status(200).json(new ApiResponse(200, result, `Status: ${isOnline ? "Online" : "Offline"}`));
});

// PATCH /api/delivery/location
// Body: { latitude, longitude }
// Called by delivery boy app at regular intervals (every 5-10 seconds)
const updateLocation = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.updateLocation(req.deliveryBoy._id, req.body);
  res.status(200).json(new ApiResponse(200, result, "Location updated"));
});

// ═════════════════════════════════════════════════════════════════════════════
//  ORDERS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/delivery/available-orders
// Delivery boy sees orders he can accept
const getAvailableOrders = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.getAvailableOrders(req.deliveryBoy._id);
  res.status(200).json(new ApiResponse(200, result, "Available orders fetched"));
});

// POST /api/delivery/orders/:orderId/accept
// Delivery boy accepts an order
const acceptOrder = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.acceptOrder(
    req.deliveryBoy._id,
    req.params.orderId
  );
  res.status(200).json(new ApiResponse(200, result, "Order accepted successfully"));
});

// PATCH /api/delivery/orders/:orderId/status
// Body: { deliverystatus: "out_for_delivery" | "delivered", note? }
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.updateDeliveryStatus(
    req.deliveryBoy._id,
    req.params.orderId,
    req.body
  );
  res.status(200).json(new ApiResponse(200, result, "Delivery status updated"));
});

// GET /api/delivery/current-order
// Delivery boy sees his current active order + customer location
const getCurrentOrder = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.getCurrentOrder(req.deliveryBoy._id);
  res.status(200).json(new ApiResponse(200, result, "Current order fetched"));
});

// GET /api/delivery/order-history
// Query: ?page=1&limit=20
const getOrderHistory = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.getMyOrderHistory(req.deliveryBoy._id, req.query);
  res.status(200).json(new ApiResponse(200, result, "Order history fetched"));
});

// GET /api/delivery/earnings
// Delivery boy earnings breakdown
const getMyEarnings = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.getMyEarnings(req.deliveryBoy._id);
  res.status(200).json(new ApiResponse(200, result, "Earnings fetched"));
});

// ═════════════════════════════════════════════════════════════════════════════
//  CUSTOMER — Track delivery boy
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/orders/:orderId/track
// Customer tracks his delivery boy's live location
// Auth: user token required
const trackDeliveryBoy = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;  // from user auth middleware
  const result = await DeliveryBoyService.getDeliveryBoyLocation(
    req.params.orderId,
    userId
  );
  res.status(200).json(new ApiResponse(200, result, "Delivery boy location fetched"));
});

// POST /api/orders/:orderId/rate-delivery
// Body: { rating: 1-5, comment? }
// Customer rates delivery boy after delivery
const rateDelivery = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.rateDelivery(
    req.params.orderId,
    req.user._id,
    req.body
  );
  res.status(200).json(new ApiResponse(200, result, "Rating submitted"));
});

// ═════════════════════════════════════════════════════════════════════════════
//  ADMIN
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/admin/delivery-boys?page=1&limit=20&isOnline=true
const getAllDeliveryBoys = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.getAllDeliveryBoys(req.query);
  res.status(200).json(new ApiResponse(200, result, "Delivery boys fetched"));
});

// PATCH /api/admin/delivery-boys/:deliveryBoyId/approve
// Body: { isApproved?: boolean, isActive?: boolean }
const approveDeliveryBoy = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.approveDeliveryBoy(
    req.params.deliveryBoyId,
    req.body
  );
  res.status(200).json(new ApiResponse(200, result, "Delivery boy status updated"));
});

// POST /api/admin/orders/:orderId/assign-delivery-boy
// Body: { deliveryBoyId }
// Admin manually assigns a delivery boy to an order
const assignDeliveryBoy = asyncHandler(async (req, res) => {
  const result = await DeliveryBoyService.assignDeliveryBoy(
    req.params.orderId,
    req.body.deliveryBoyId
  );
  res.status(200).json(new ApiResponse(200, result, "Delivery boy assigned"));
});

export {
  // Auth
  register,
  login,
  logout,
  refreshToken,

  // Profile
  getProfile,
  updateProfile,
  changePassword,

  // Status & Location
  toggleOnlineStatus,
  updateLocation,

  // Orders (Delivery Boy)
  getAvailableOrders,
  acceptOrder,
  updateDeliveryStatus,
  getCurrentOrder,
  getOrderHistory,
  getMyEarnings,

  // Customer
  trackDeliveryBoy,
  rateDelivery,

  // Admin
  getAllDeliveryBoys,
  approveDeliveryBoy,
  assignDeliveryBoy,
};