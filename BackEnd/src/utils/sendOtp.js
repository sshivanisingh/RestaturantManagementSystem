import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
import { OTP } from "../models/otp.model.js";

// ─── OTP Generator ────────────────────────────────────────────────────────────
export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── SMTP Transporter ─────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,

  // 587 = STARTTLS
  // 465 = SSL
  secure: Number(process.env.SMTP_PORT) === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// ─── Verify SMTP when server starts ───────────────────────────────────────────

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:");
    console.error(error);
  } else {
    console.log("✅ SMTP server is ready:", success);
  }
});

// Legacy in-memory store
export const otpStore = new Map();

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export const sendOtp = async (email, name = "User") => {
  const otp = generateOtp();
  const normalizedEmail = email.toLowerCase();

  try {
    console.log("🔐 Generated OTP for:", normalizedEmail);

    // Delete previous OTP
    await OTP.deleteMany({
      email: normalizedEmail,
    });

    // Save new OTP
    await OTP.create({
      email: normalizedEmail,
      otp,
    });

    console.log("💾 OTP saved to MongoDB");

    console.log("📧 Sending OTP email to:", email);

    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "BiteNest"}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Verification OTP",

      html: `
        <div style="
          font-family:Arial,sans-serif;
          max-width:420px;
          margin:auto;
          padding:32px;
          border:1px solid #e5e7eb;
          border-radius:8px;
          text-align:center;
        ">
          <h2 style="color:#111;margin:0 0 8px;">
            Hello, ${name} 👋
          </h2>

          <p style="color:#6b7280;margin:0 0 24px;">
            Your email verification code:
          </p>

          <div style="
            font-size:42px;
            font-weight:700;
            letter-spacing:10px;
            color:#f97316;
            margin:0 0 24px;
          ">
            ${otp}
          </div>

          <p style="
            color:#9ca3af;
            font-size:13px;
            margin:0;
          ">
            Expires in <strong>10 minutes</strong>.<br/>
            Ignore if you didn't request this.
          </p>
        </div>
      `,

      text: `Hello ${name}, your OTP is: ${otp} (valid 10 minutes)`,
    });

    console.log("✅ OTP email sent successfully");
    console.log("📨 Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ OTP email error:");
    console.error(error);

    // Clean up OTP if email failed
    await OTP.deleteMany({
      email: normalizedEmail,
    }).catch((cleanupError) => {
      console.error("❌ OTP cleanup failed:", cleanupError);
    });

    throw new ApiError(
      500,
      "Failed to send OTP. Please try again.",
      [],
      error?.stack,
    );
  }

  return {
    message: "OTP sent to email",
  };
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export const verifyOtp = async (email, otp) => {
  const key = email.toLowerCase();

  const record = await OTP.findOne({
    email: key,
  });

  if (!record) {
    throw new ApiError(
      400,
      "OTP not found or already used. Please request a new one.",
    );
  }

  // OTP expires after 10 minutes
  const createdAtTime = record.createdAt.getTime();
  const expiryTime = createdAtTime + 10 * 60 * 1000;

  if (Date.now() > expiryTime) {
    await OTP.deleteOne({
      _id: record._id,
    }).catch(() => {});

    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (record.otp !== String(otp)) {
    throw new ApiError(400, "Invalid OTP. Please try again.");
  }

  // Delete OTP after successful verification
  await OTP.deleteOne({
    _id: record._id,
  }).catch(() => {});

  return true;
};
