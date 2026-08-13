import { Router } from "express";
 import { upload } from "../middleware/multer.middleware.js";
 import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  register, verifyOtp, resendOtp,
  login, logout, refreshToken,
  forgotPassword, resetPassword,
  sendOtp, getProfile,
  updateProfile, changePassword,
} from "../controllers/auth.controller.js";

const router = Router();

// ─── Public Routes ────────────────────────────────
router.post("/register",         upload.single("logo"), register);
router.post("/verify-otp",       verifyOtp);
router.post("/send-otp",         sendOtp);
router.post("/resend-otp",       resendOtp);
router.post("/login",            login);
router.post("/forgot-password",  forgotPassword);
router.post("/reset-password",   resetPassword);
router.post("/refresh-token",    refreshToken);
router.get("/profile",          verifyJWT, getProfile);
router.patch("/profile",        verifyJWT, upload.single("logo"), updateProfile);
router.patch("/change-password",verifyJWT, changePassword);
// ─── Protected Routes ─────────────────────────────
router.post("/logout", verifyJWT, logout);

export default router;