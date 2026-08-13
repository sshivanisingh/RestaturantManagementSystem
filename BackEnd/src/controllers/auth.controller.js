import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { AuthService }  from "../services/AuthService.js";

const register = asyncHandler(async (req, res) => {
  const logoPath = req.file?.path || null;
  const result   = await AuthService.register(req.body, logoPath);
  res.status(201).json(new ApiResponse(201, result, result.message));
});

 
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.sendOtpToEmail(email);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyOtp(email, otp);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.sendOtpToEmail(email);  
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password, res);
  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  const id = req.restaurant?._id || req.user?._id;
  const result = await AuthService.logout(id, res);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const refreshToken = asyncHandler(async (req, res) => {
  const token  = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await AuthService.refreshAccessToken(token);
  res.status(200).json(new ApiResponse(200, result, "Token refreshed"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body.email);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, password } = req.body;
  const result = await AuthService.resetPassword(token, newPassword ?? password);
  res.status(200).json(new ApiResponse(200, result, result.message));
});


const getProfile = asyncHandler(async (req, res) => {
  const result = await AuthService.getProfile(req.restaurant?._id, req.user?._id);
  res.status(200).json(new ApiResponse(200, result, "Profile fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const logoPath = req.file?.path || null;
  const result   = await AuthService.updateProfile(req.restaurant._id, req.body, logoPath);
  res.status(200).json(new ApiResponse(200, result, "Profile updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(req.restaurant._id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, result, "Password changed successfully"));
});

export {
  register, sendOtp, verifyOtp, resendOtp,
  login, logout, refreshToken,
  forgotPassword, resetPassword,
  getProfile, updateProfile, changePassword,
};