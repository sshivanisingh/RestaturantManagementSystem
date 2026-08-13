import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  // Cart
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  // Wishlist
  getWishlist, toggleWishlist,
  // Order + Payment
  placeOrder, confirmCODPayment, verifyOnlinePayment,
  // Account
  activateAccount, login, logout,
  getMyOrders, getProfile, updateProfile, changePassword,
} from "../controllers/user.controller.js";

const router = Router();

// ─── Public Routes (login nahi chahiye) ───────────────────────────────────────
router.post("/login",                          login);
router.post("/activate-account",               activateAccount);
router.post("/:restaurantId/orders",           placeOrder);          // guest order
router.post("/payments/:paymentId/cod",        confirmCODPayment);   // COD confirm
router.post("/payments/:paymentId/verify",     verifyOnlinePayment); // online payment verify

// ─── Protected Routes (login chahiye) ────────────────────────────────────────
router.use(verifyJWT);

// Profile
router.get  ("/profile",                       getProfile);
router.patch("/profile",                       updateProfile);
router.patch("/change-password",               changePassword);
router.post ("/logout",                        logout);

// Orders
router.get ("/orders",                         getMyOrders);

// Cart
router.get   ("/cart",                         getCart);
router.post  ("/cart",                         addToCart);
router.patch ("/cart",                         updateCartItem);
router.delete("/cart/:menuItemId",             removeFromCart);
router.delete("/cart",                         clearCart);

// Wishlist
router.get  ("/wishlist",                      getWishlist);
router.post ("/wishlist/toggle",               toggleWishlist);

export default router;