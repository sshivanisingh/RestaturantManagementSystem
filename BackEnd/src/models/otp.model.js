import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Auto-delete after 10 minutes (600 seconds)
    },
  },
  { timestamps: false }
);

// Compound index: email + createdAt for efficient cleanup
otpSchema.index({ email: 1, createdAt: 1 });

export const OTP = mongoose.model("OTP", otpSchema);
