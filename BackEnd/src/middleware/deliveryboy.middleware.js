import jwt            from "jsonwebtoken";
import { DeliveryBoy } from "../models/deliveryboy.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── Verify Delivery Boy Token ─────────────────────────────────────────────
// Reads JWT from cookie OR Authorization header
// Attaches req.deliveryBoy = { _id, name, email, role }
export const verifyDeliveryBoyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.deliveryAccessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized — delivery boy token required");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired delivery boy token");
  }

  if (decoded.role !== "deliveryBoy") {
    throw new ApiError(403, "Access denied — not a delivery boy token");
  }

  const deliveryBoy = await DeliveryBoy.findById(decoded._id).select(
    "-password -refreshToken -otp -otpExpiry"
  );

  if (!deliveryBoy)            throw new ApiError(401, "Delivery boy not found");
  if (!deliveryBoy.isActive)   throw new ApiError(403, "Account deactivated");
  if (!deliveryBoy.isApproved) throw new ApiError(403, "Account not approved yet");

  req.deliveryBoy = deliveryBoy;
  next();
});