import { ApiError } from "./ApiError.js";
import { OTP } from "../models/otp.model.js";
import { sendEmail } from "./sendEmail.js";

// ─────────────────────────────────────────────────────────────────────────────
// Generate OTP
// ─────────────────────────────────────────────────────────────────────────────

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy in-memory store
// ─────────────────────────────────────────────────────────────────────────────

export const otpStore = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// Send OTP
// ─────────────────────────────────────────────────────────────────────────────

export const sendOtp = async (email, name = "User") => {
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const otp = generateOtp();

  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 OTP EMAIL REQUEST");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📩 To:", normalizedEmail);

    // Check Gmail configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("❌ SMTP configuration is missing");

      throw new ApiError(500, "Email service is not configured");
    }

    console.log("🔐 SMTP configuration loaded");

    // Remove previous OTP
    await OTP.deleteMany({
      email: normalizedEmail,
    });

    // Save new OTP
    await OTP.create({
      email: normalizedEmail,
      otp,
    });

    console.log("💾 OTP saved to MongoDB");

    // Send email
    await sendEmail({
      to: normalizedEmail,

      subject: `${otp} — BiteNest Email Verification OTP`,

      html: `
        <!DOCTYPE html>

        <html>
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <title>BiteNest Email Verification</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
              font-family: Arial, Helvetica, sans-serif;
            "
          >

            <div
              style="
                max-width: 480px;
                margin: 40px auto;
                padding: 32px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                text-align: center;
              "
            >

              <h2
                style="
                  margin: 0 0 12px;
                  color: #111827;
                "
              >
                Hello, ${name} 👋
              </h2>

              <p
                style="
                  margin: 0 0 24px;
                  color: #6b7280;
                  font-size: 15px;
                  line-height: 1.6;
                "
              >
                Use the following one-time password
                to verify your BiteNest email address.
              </p>

              <div
                style="
                  display: inline-block;
                  padding: 15px 25px;
                  background-color: #f3f4f6;
                  border-radius: 8px;
                  color: #f97316;
                  font-size: 38px;
                  font-weight: 700;
                  letter-spacing: 10px;
                  margin: 10px 0 25px;
                "
              >
                ${otp}
              </div>

              <p
                style="
                  margin: 0 0 12px;
                  color: #6b7280;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This OTP will expire in
                <strong>10 minutes</strong>.
              </p>

              <p
                style="
                  margin: 20px 0 0;
                  color: #9ca3af;
                  font-size: 12px;
                  line-height: 1.6;
                "
              >
                If you did not request this verification code,
                you can safely ignore this email.
              </p>

              <hr
                style="
                  margin: 25px 0;
                  border: 0;
                  border-top: 1px solid #e5e7eb;
                "
              />

              <p
                style="
                  margin: 0;
                  color: #9ca3af;
                  font-size: 11px;
                "
              >
                © ${new Date().getFullYear()} BiteNest
              </p>

            </div>

          </body>
        </html>
      `,

      text: `
Hello ${name},

Your BiteNest email verification OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request this verification code,
you can safely ignore this email.

© ${new Date().getFullYear()} BiteNest
      `.trim(),
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ OTP EMAIL SENT SUCCESSFULLY");
    console.log("📩 Recipient:", normalizedEmail);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      message: "OTP sent to email",
    };
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ OTP EMAIL ERROR");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(error);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Remove OTP if email failed
    await OTP.deleteMany({
      email: normalizedEmail,
    }).catch((cleanupError) => {
      console.error("❌ OTP cleanup failed:", cleanupError.message);
    });

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "Failed to send OTP. Please try again.",
      [],
      error?.stack,
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────────────────────────────────────────

export const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const record = await OTP.findOne({
    email: normalizedEmail,
  });

  if (!record) {
    throw new ApiError(
      400,
      "OTP not found or already used. Please request a new one.",
    );
  }

  // Check expiry
  const createdAtTime = record.createdAt.getTime();

  const expiryTime = createdAtTime + 10 * 60 * 1000;

  if (Date.now() > expiryTime) {
    await OTP.deleteOne({
      _id: record._id,
    }).catch(() => {});

    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  // Check OTP
  if (record.otp !== String(otp).trim()) {
    throw new ApiError(400, "Invalid OTP. Please try again.");
  }

  // Delete OTP after successful verification
  await OTP.deleteOne({
    _id: record._id,
  });

  console.log("✅ OTP verified successfully for:", normalizedEmail);

  return true;
};
