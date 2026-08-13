import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const restaurantSchema = new Schema(
  {
    // ─── Owner Details ──────────────────────────
    owner: {
      fullName : { type: String, required: true, trim: true },
      email    : { type: String, required: true, unique: true,
                   lowercase: true, trim: true },
      phone    : { type: String, required: true, trim: true },
      address  : { type: String, required: true, trim: true },

      role     : { type: String, required: true, default: "admin" },
      isActive : { type: Boolean, default: true },
    },

    // ─── Restaurant Details ──────────────────────
    name    : { type: String, required: true, trim: true, index: true },
    email   : { type: String, required: true, unique: true,
                lowercase: true, trim: true },
    phone   : { type: String, required: true, trim: true },
    address : { type: String, required: true, trim: true },
    logo    : { type: String, default: "" },  

    // ─── Auth ────────────────────────────────────
    password     : { type: String, required: true },
    refreshToken : { type: String, default: null },

    // ─── Email Verification ──────────────────────
    isEmailVerified    : { type: Boolean, default: false },
    emailOtp           : { type: String,  default: null },
    emailOtpExpiry     : { type: Date,    default: null },

    // ─── Password Reset ──────────────────────────
    resetPasswordToken  : { type: String, default: null },
    resetPasswordExpiry : { type: Date,   default: null },

    // ─── Status ──────────────────────────────────
    isActive : { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Hash password before save ───────────────────
restaurantSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance Methods ─────────────────────────────
restaurantSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

restaurantSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.owner.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

restaurantSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
  );
};

// ─── Generate OTP (6 digit) ───────────────────────
restaurantSchema.methods.generateEmailOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailOtp       = otp;
  this.emailOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
  return otp;
};

// ─── Generate Reset Token ─────────────────────────
restaurantSchema.methods.generateResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken  = crypto
    .createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min
  return rawToken;
};

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);