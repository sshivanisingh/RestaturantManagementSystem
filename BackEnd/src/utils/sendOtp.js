import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
import { OTP } from "../models/otp.model.js";

// ─── OTP Generator ────────────────────────────────────────────────────────────
export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Transporter ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Legacy in-memory store (for backwards compatibility, but deprecated)
export const otpStore = new Map();

// ─── sendOtp ──────────────────────────────────────────────────────────────────
/**
 * Sends OTP via email and stores in MongoDB with TTL
 * @param {string} email  - receiver email
 * @param {string} name   - receiver name (optional, default "User")
 */
export const sendOtp = async (email, name = "User") => {
  const otp = generateOtp();

  try {
    // Save OTP to MongoDB (TTL index will auto-delete after 10 minutes)
    await OTP.deleteMany({ email: email.toLowerCase() }); // Delete any existing OTP for this email
    await OTP.create({
      email: email.toLowerCase(),
      otp,
    });

    await transporter.sendMail({
      from    : `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to      : email,
      subject : "Your Verification OTP",
      html    : `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;
                    padding:32px;border:1px solid #e5e7eb;border-radius:8px;
                    text-align:center;">
          <h2 style="color:#111;margin:0 0 8px;">Hello, ${name} 👋</h2>
          <p style="color:#6b7280;margin:0 0 24px;">
            Your email verification code:
          </p>
          <div style="font-size:42px;font-weight:700;letter-spacing:10px;
                      color:#f97316;margin:0 0 24px;">
            ${otp}
          </div>
          <p style="color:#9ca3af;font-size:13px;margin:0;">
            Expires in <strong>10 minutes</strong>.<br/>
            Ignore if you didn't request this.
          </p>
        </div>`,
      text: `Hello ${name}, your OTP is: ${otp} (valid 10 minutes)`,
    });
  } catch (error) {
    // Clean up on email failure
    await OTP.deleteMany({ email: email.toLowerCase() }).catch(() => {});
    throw new ApiError(500, "Failed to send OTP. Please try again.");
  }

  return { message: "OTP sent to email" };
};

// ─── verifyOtp ────────────────────────────────────────────────────────────────
/**
 * Verifies OTP from MongoDB
 * @param {string} email
 * @param {string} otp
 * @returns {boolean} true if valid
 */
export const verifyOtp = async (email, otp) => {
  const key = email.toLowerCase();

  const record = await OTP.findOne({ email: key });

  if (!record) {
    throw new ApiError(400, "OTP not found or already used. Please request a new one.");
  }

  // TTL index will auto-delete after 10 minutes, but verify just in case
  const createdAtTime = record.createdAt.getTime();
  const expiryTime = createdAtTime + 10 * 60 * 1000; // 10 minutes
  if (Date.now() > expiryTime) {
    await OTP.deleteOne({ _id: record._id }).catch(() => {});
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (record.otp !== String(otp)) {
    throw new ApiError(400, "Invalid OTP. Please try again.");
  }

  // Delete OTP after successful verification
  await OTP.deleteOne({ _id: record._id }).catch(() => {});
  return true;
};