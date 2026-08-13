// services/DeliveryBoyAuth.service.js
import { DeliveryBoy } from "../models/deliveryBoy.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendOtp, verifyOtp } from "../utils/sendOtp.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

class DeliveryBoyAuthService {
  static async register(data, profileImagePath) {
    const {
      fullName, email, phone, password, address, city, pincode,
      vehicleType, vehicleNumber, licenseNumber, aadharNumber,
    } = data;

    // Check if email already exists
    const existing = await DeliveryBoy.findOne({
      $or: [{ email }, { phone }, { vehicleNumber }, { licenseNumber }, { aadharNumber }]
    });

    if (existing) {
      if (existing.email === email) throw new ApiError(409, "Email already registered");
      if (existing.phone === phone) throw new ApiError(409, "Phone number already registered");
      if (existing.vehicleNumber === vehicleNumber) throw new ApiError(409, "Vehicle number already registered");
      if (existing.licenseNumber === licenseNumber) throw new ApiError(409, "License number already registered");
      if (existing.aadharNumber === aadharNumber) throw new ApiError(409, "Aadhar number already registered");
    }

    // Upload profile image
    let profileImage = "";
    if (profileImagePath) {
      const uploaded = await uploadOnCloudinary(profileImagePath);
      if (uploaded?.url) profileImage = uploaded.url;
    }

    // Create delivery boy
    const deliveryBoy = await DeliveryBoy.create({
      fullName, email, phone, password, address, city, pincode,
      vehicleType, vehicleNumber, licenseNumber, aadharNumber,
      profileImage,
      isVerified: false,
    });

    return { message: "Registration successful! Please verify your email with OTP.", deliveryBoyId: deliveryBoy._id };
  }

  static async sendOtpToEmail(email, name = "Delivery Partner") {
    if (!email) throw new ApiError(400, "Email is required");
    await sendOtp(email, name);
    return { message: "OTP sent to email" };
  }

  static async verifyOtp(email, otp) {
    if (!email || !otp) throw new ApiError(400, "Email and OTP are required");
    const isValid = verifyOtp(email, otp);
    if (!isValid) throw new ApiError(400, "Invalid OTP");
    
    // Mark as verified
    await DeliveryBoy.findOneAndUpdate({ email }, { isVerified: true });
    return { message: "Email verified successfully!" };
  }

  static async login(email, password, res) {
    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) throw new ApiError(404, "No account found with this email");
    
    if (!deliveryBoy.isVerified) throw new ApiError(403, "Please verify your email first");
    if (!deliveryBoy.isActive) throw new ApiError(403, "Account is deactivated");
    
    const isValid = await deliveryBoy.isPasswordCorrect(password);
    if (!isValid) throw new ApiError(401, "Invalid credentials");
    
    const accessToken = deliveryBoy.generateAccessToken();
    const refreshToken = deliveryBoy.generateRefreshToken();
    
    deliveryBoy.refreshToken = refreshToken;
    await deliveryBoy.save({ validateBeforeSave: false });
    
    res.cookie("deliveryAccessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie("deliveryRefreshToken", refreshToken, { ...cookieOptions, maxAge: 10 * 24 * 60 * 60 * 1000 });
    
    const { password: _, refreshToken: __, ...safeData } = deliveryBoy.toObject();
    return { role: "delivery_boy", data: safeData, accessToken };
  }

  static async logout(deliveryBoyId, res) {
    await DeliveryBoy.findByIdAndUpdate(deliveryBoyId, { $unset: { refreshToken: 1 } });
    res.clearCookie("deliveryAccessToken", cookieOptions);
    res.clearCookie("deliveryRefreshToken", cookieOptions);
    return { message: "Logged out successfully" };
  }

  static async getProfile(deliveryBoyId) {
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).select("-password -refreshToken");
    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    return deliveryBoy;
  }

  static async updateLocation(deliveryBoyId, { coordinates, address }) {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      {
        currentLocation: {
          type: "Point",
          coordinates: coordinates || [0, 0],
          address: address || "",
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).select("-password -refreshToken");
    
    return deliveryBoy;
  }

  static async updateAvailability(deliveryBoyId, isAvailable) {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      { isAvailable },
      { new: true }
    ).select("-password -refreshToken");
    
    return deliveryBoy;
  }
}

export { DeliveryBoyAuthService, cookieOptions };