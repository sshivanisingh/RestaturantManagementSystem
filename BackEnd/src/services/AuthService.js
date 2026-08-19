import crypto from "crypto";
import jwt from "jsonwebtoken";

import { Restaurant } from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendOtp, verifyOtp, otpStore } from "../utils/sendOtp.js";
import { sendEmail } from "../utils/sendEmail.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

// ─── Cookie Options ───────────────────────────────────────────────────────────

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// ─── Auth Service ─────────────────────────────────────────────────────────────

class AuthService {
  // ─── Register ───────────────────────────────────────────────────────────────

  static async register(data, logoLocalPath) {
    const {
      ownerFullName,
      ownerEmail,
      ownerPhone,
      ownerAddress,
      restaurantName,
      restaurantEmail,
      restaurantPhone,
      restaurantAddress,
      password,
    } = data;

    const exists = await Restaurant.findOne({
      $or: [{ "owner.email": ownerEmail }, { email: restaurantEmail }],
    });

    if (exists) {
      throw new ApiError(409, "Email already registered");
    }

    let logoUrl = "";

    if (logoLocalPath) {
      const uploaded = await uploadOnCloudinary(logoLocalPath);

      if (!uploaded?.url) {
        throw new ApiError(500, "Logo upload failed");
      }

      logoUrl = uploaded.url;
    }

    await Restaurant.create({
      owner: {
        fullName: ownerFullName,
        email: ownerEmail,
        phone: ownerPhone,
        address: ownerAddress,
      },

      name: restaurantName,
      email: restaurantEmail,
      phone: restaurantPhone,
      address: restaurantAddress,
      logo: logoUrl,
      password,
    });

    return {
      message: "Account Created Successfully",
    };
  }

  // ─── Send OTP ──────────────────────────────────────────────────────────────

  static async sendOtpToEmail(email) {
    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    await sendOtp(email);

    return {
      message: "OTP sent to email",
    };
  }

  // ─── Verify OTP ────────────────────────────────────────────────────────────

  static async verifyOtp(email, otp) {
    if (!email || !otp) {
      throw new ApiError(400, "Email and OTP are required");
    }

    await verifyOtp(email, otp);

    return {
      message: "Email verified successfully!",
    };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  static async login(email, password, res) {
    // 1. Try Restaurant first
    const restaurant = await Restaurant.findOne({
      $or: [{ "owner.email": email }, { email }],
    });

    if (restaurant) {
      const isValid = await restaurant.isPasswordCorrect(password);

      if (!isValid) {
        throw new ApiError(401, "Invalid credentials");
      }

      const accessToken = restaurant.generateAccessToken();

      const refreshToken = restaurant.generateRefreshToken();

      restaurant.refreshToken = refreshToken;

      await restaurant.save({
        validateBeforeSave: false,
      });

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 10 * 24 * 60 * 60 * 1000,
      });

      const {
        password: _,
        refreshToken: __,
        ...safeData
      } = restaurant.toObject();

      return {
        role: "restaurant",
        data: safeData,
        accessToken,
      };
    }

    // 2. Fallback → User collection
    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(404, "No account found with this email");
    }

    // Account must be active
    if (!user.isActive) {
      throw new ApiError(403, "Account not activated");
    }

    const isValid = await user.isPasswordCorrect(password);

    if (!isValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    const { password: _, refreshToken: __, ...safeData } = user.toObject();

    return {
      role: "customer",
      data: safeData,
      accessToken,
    };
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  static async logout(userId, res) {
    // Try Restaurant first
    let result = await Restaurant.findByIdAndUpdate(
      userId,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      },
    );

    // If not restaurant, try User
    if (!result) {
      result = await User.findByIdAndUpdate(
        userId,
        {
          $unset: {
            refreshToken: 1,
          },
        },
        {
          new: true,
        },
      );
    }

    res.clearCookie("accessToken", cookieOptions);

    res.clearCookie("refreshToken", cookieOptions);

    return {
      message: "Logged out successfully",
    };
  }

  // ─── Refresh Token ─────────────────────────────────────────────────────────

  static async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    let decoded;

    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
    } catch {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Try Restaurant first
    const restaurant = await Restaurant.findById(decoded._id);

    if (restaurant && restaurant.refreshToken === incomingRefreshToken) {
      const accessToken = restaurant.generateAccessToken();

      return {
        accessToken,
      };
    }

    // Try User
    const user = await User.findById(decoded._id);

    if (user && user.refreshToken === incomingRefreshToken) {
      const accessToken = user.generateAccessToken();

      return {
        accessToken,
      };
    }

    throw new ApiError(401, "Refresh token expired or already used");
  }

  // ─── Forgot Password ───────────────────────────────────────────────────────

  static async forgotPassword(email) {
    const restaurant = await Restaurant.findOne({
      "owner.email": email,
    });

    if (!restaurant) {
      throw new ApiError(404, "No account with this email");
    }

    const rawToken = restaurant.generateResetToken();

    await restaurant.save({
      validateBeforeSave: false,
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    try {
      console.log("📧 Sending password reset email to:", email);

      await sendEmail({
        to: email,

        subject: "Password Reset Request",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 420px;
            margin: auto;
            padding: 32px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #ffffff;
          ">

            <h2 style="
              color: #111827;
              margin-bottom: 20px;
            ">
              Password Reset 🔐
            </h2>

            <p style="
              color: #374151;
              font-size: 15px;
            ">
              Hi ${restaurant.owner.fullName},
            </p>

            <p style="
              color: #374151;
              font-size: 15px;
            ">
              We received a request to reset your
              BiteNest account password.
            </p>

            <p style="
              color: #374151;
              font-size: 15px;
            ">
              Click the button below to reset your
              password:
            </p>

            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 28px;
                background: #dc2626;
                color: #ffffff;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
                margin: 16px 0;
              "
            >
              Reset Password
            </a>

            <p style="
              color: #9ca3af;
              font-size: 13px;
              margin-top: 20px;
            ">
              This password reset link will expire
              in <strong>15 minutes</strong>.
            </p>

            <p style="
              color: #9ca3af;
              font-size: 13px;
            ">
              If you didn't request a password reset,
              you can safely ignore this email.
            </p>

          </div>
        `,

        text:
          `Hi ${restaurant.owner.fullName},\n\n` +
          `We received a request to reset your ` +
          `BiteNest account password.\n\n` +
          `Reset your password using this link:\n` +
          `${resetUrl}\n\n` +
          `This link expires in 15 minutes.\n\n` +
          `If you didn't request a password reset, ` +
          `you can safely ignore this email.`,
      });

      console.log("✅ Password reset email sent successfully");
    } catch (error) {
      console.error("❌ Password reset email error:");
      console.error(error);

      // Clear reset token if email sending fails
      restaurant.resetPasswordToken = null;
      restaurant.resetPasswordExpiry = null;

      await restaurant.save({
        validateBeforeSave: false,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, "Reset email failed. Try again.");
    }

    return {
      message: "Password reset link sent to email",
    };
  }

  // ─── Reset Password ────────────────────────────────────────────────────────

  static async resetPassword(rawToken, newPassword) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const restaurant = await Restaurant.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: {
        $gt: Date.now(),
      },
    });

    if (!restaurant) {
      throw new ApiError(400, "Reset link invalid or expired");
    }

    restaurant.password = newPassword;
    restaurant.resetPasswordToken = null;
    restaurant.resetPasswordExpiry = null;
    restaurant.refreshToken = null;

    await restaurant.save();

    return {
      message: "Password reset successful! Please login again.",
    };
  }

  // ─── Get Profile ───────────────────────────────────────────────────────────

  static async getProfile(restaurantId, userId) {
    // Restaurant profile
    if (restaurantId) {
      const restaurant = await Restaurant.findById(restaurantId).select(
        "-password -refreshToken",
      );

      if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
      }

      return {
        role: "restaurant",
        data: restaurant,
      };
    }

    // Customer profile
    if (userId) {
      const user = await User.findById(userId)
        .select("-password -refreshToken")
        .populate({
          path: "orders",
          populate: [
            {
              path: "userId",
              select: "name email phone",
            },
            {
              path: "paymentId",
            },
          ],
        })
        .populate({
          path: "cart.menuItemId",
        })
        .populate({
          path: "wishlist",
        });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      return {
        role: "customer",
        data: user,
      };
    }

    throw new ApiError(401, "Unauthorized");
  }

  // ─── Update Restaurant Profile ─────────────────────────────────────────────

  static async updateProfile(restaurantId, data, logoLocalPath) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }

    const {
      ownerFullName,
      ownerPhone,
      ownerAddress,
      restaurantName,
      restaurantPhone,
      restaurantAddress,
    } = data;

    if (ownerFullName) {
      restaurant.owner.fullName = ownerFullName.trim();
    }

    if (ownerPhone) {
      restaurant.owner.phone = ownerPhone.trim();
    }

    if (ownerAddress) {
      restaurant.owner.address = ownerAddress.trim();
    }

    if (restaurantName) {
      restaurant.name = restaurantName.trim();
    }

    if (restaurantPhone) {
      restaurant.phone = restaurantPhone.trim();
    }

    if (restaurantAddress) {
      restaurant.address = restaurantAddress.trim();
    }

    if (logoLocalPath) {
      const uploaded = await uploadOnCloudinary(logoLocalPath);

      if (uploaded?.secure_url) {
        restaurant.logo = uploaded.secure_url;
      }
    }

    await restaurant.save({
      validateBeforeSave: false,
    });

    const updated = await Restaurant.findById(restaurantId).select(
      "-password -refreshToken",
    );

    return updated;
  }

  // ─── Change Password ───────────────────────────────────────────────────────

  static async changePassword(restaurantId, currentPassword, newPassword) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }

    const isMatch = await restaurant.isPasswordCorrect(currentPassword);

    if (!isMatch) {
      throw new ApiError(400, "Current password is incorrect");
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, "New password must be at least 6 characters");
    }

    restaurant.password = newPassword;

    await restaurant.save();

    return {
      message: "Password changed successfully",
    };
  }
}

export { AuthService, cookieOptions };
