import mongoose, { Schema } from "mongoose";
import bcrypt               from "bcrypt";
import jwt                  from "jsonwebtoken";

// ═════════════════════════════════════════════════════════════════════════════
//  DELIVERY BOY MODEL
// ═════════════════════════════════════════════════════════════════════════════

const locationSchema = new Schema(
  {
    type       : { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
  },
  { _id: false }
);

const deliveryBoySchema = new Schema(
  {
    restaurantId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "Restaurant",
    },

    // ── Basic Info ──────────────────────────────────────────────────────────
    name    : { type: String, required: true, trim: true },
    email   : { type: String, required: true, trim: true, lowercase: true },
    phone   : { type: String, required: true, trim: true },
    password: { type: String, required: true },
    avatar  : { type: String, default: null },

    // ── Vehicle Info ────────────────────────────────────────────────────────
    vehicleType  : {
      type: String,
      enum: ["bike", "bicycle", "scooter", "car"],
      default: "bike",
    },
    vehicleNumber: { type: String, trim: true, default: null },

    // ── Status ──────────────────────────────────────────────────────────────
    isActive  : { type: Boolean, default: true },   // admin can deactivate
    isOnline  : { type: Boolean, default: false },  // boy sets himself online/offline
    isApproved: { type: Boolean, default: false },  // admin approves new delivery boys

    // ── Current State ───────────────────────────────────────────────────────
    currentLocation: {
      type   : locationSchema,
      default: () => ({ type: "Point", coordinates: [0, 0] }),
    },
    lastLocationUpdatedAt: { type: Date, default: null },

    // Currently assigned order (null if free)
    currentOrderId: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : "Order",
      default: null,
    },

    // ── Stats ────────────────────────────────────────────────────────────────
    totalDeliveries   : { type: Number, default: 0 },
    totalEarnings     : { type: Number, default: 0 },
    averageRating     : { type: Number, default: 0, min: 0, max: 5 },
    totalRatings      : { type: Number, default: 0 },

    // ── Tokens ──────────────────────────────────────────────────────────────
    refreshToken: { type: String, default: null },

    // ── OTP for verification ─────────────────────────────────────────────────
    otp          : { type: String, default: null },
    otpExpiry    : { type: Date,   default: null },
    isVerified   : { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Geospatial index for location queries
deliveryBoySchema.index({ currentLocation: "2dsphere" });

// Compound unique index — same phone/email per restaurant
deliveryBoySchema.index({ email: 1, restaurantId: 1 }, { unique: true });
deliveryBoySchema.index({ phone: 1, restaurantId: 1 }, { unique: true });

// ── Pre-save: hash password ────────────────────────────────────────────────
deliveryBoySchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// ── Methods ────────────────────────────────────────────────────────────────
deliveryBoySchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

deliveryBoySchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: "deliveryBoy" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

deliveryBoySchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, role: "deliveryBoy" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

export const DeliveryBoy = mongoose.model("DeliveryBoy", deliveryBoySchema);