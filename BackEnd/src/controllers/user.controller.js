import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
 import { UserService } from "../services/User.service.js";

// ─── Cart ─────────────────────────────────────────────────────────────────────
const getCart = asyncHandler(async (req, res) => {
  const result = await UserService.getCart(req.user._id);
  res.status(200).json(new ApiResponse(200, result, "Cart fetched"));
});

const addToCart = asyncHandler(async (req, res) => {
  const { menuItemId, quantity } = req.body;

  const result = await UserService.addToCart(req.user._id, menuItemId, quantity);
  res.status(200).json(new ApiResponse(200, result, "Item added to cart"));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { menuItemId, quantity } = req.body;
  const result = await UserService.updateCartItem(req.user._id, menuItemId, quantity);
  res.status(200).json(new ApiResponse(200, result, "Cart updated"));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { menuItemId } = req.params;
  const result = await UserService.removeFromCart(req.user._id, menuItemId);
  res.status(200).json(new ApiResponse(200, result, "Item removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
  const result = await UserService.clearCart(req.user._id);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────
const getWishlist = asyncHandler(async (req, res) => {
  const result = await UserService.getWishlist(req.user._id);
  res.status(200).json(new ApiResponse(200, result, "Wishlist fetched"));
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { menuItemId } = req.body;
  const result = await UserService.toggleWishlist(req.user._id, menuItemId);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// ─── Order + Payment ──────────────────────────────────────────────────────────
const placeOrder = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const result = await UserService.placeOrder(restaurantId, req.body);
  res.status(201).json(new ApiResponse(201, result, "Order placed successfully"));
});

const confirmCODPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const result = await UserService.confirmCODPayment(paymentId);
  res.status(200).json(new ApiResponse(200, result, "COD payment confirmed"));
});

const verifyOnlinePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const result = await UserService.verifyOnlinePayment(paymentId, req.body);
  res.status(200).json(new ApiResponse(200, result, "Payment verified"));
});

// ─── Account ──────────────────────────────────────────────────────────────────
const activateAccount = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await UserService.activateAccount(token, newPassword);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await UserService.login(email, password, res);
  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  const id = req.user?._id || req.restaurant?._id;
  const result = await UserService.logout(id, res);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await UserService.getMyOrders(req.user._id);
  res.status(200).json(new ApiResponse(200, result, "Orders fetched"));
});

const getProfile = asyncHandler(async (req, res) => {
  const result = await UserService.getProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, result, "Profile fetched"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const result = await UserService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, result, "Profile updated"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await UserService.changePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

export {
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  getWishlist, toggleWishlist,
  placeOrder, confirmCODPayment, verifyOnlinePayment,
  activateAccount, login, logout,
  getMyOrders, getProfile, updateProfile, changePassword,
};