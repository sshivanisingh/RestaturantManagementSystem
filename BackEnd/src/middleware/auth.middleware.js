import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Restaurant } from "../models/restaurant.model.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized request");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Access token invalid or expired");
  }

  // ── 1. Restaurant dhundo ──────────────────────────────────────────────
  const restaurant = await Restaurant.findById(decoded._id).select(
    "-password -refreshToken -emailOtp -resetPasswordToken"
  );

  if (restaurant) {
    if (!restaurant.isActive) throw new ApiError(403, "Account deactivated");
    req.restaurant = restaurant;
    return next();
  }

  // ── 2. Restaurant nahi mila → User dhundo ────────────────────────────
  const user = await User.findById(decoded._id).select(
    "-password -refreshToken -emailOtp -resetPasswordToken"
  );

  if (!user) throw new ApiError(401, "User not found");
  if (!user.isActive) throw new ApiError(403, "Account deactivated");

  req.user = user;
  return next();
});
 