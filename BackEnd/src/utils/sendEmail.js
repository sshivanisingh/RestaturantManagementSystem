import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────────────────────
// SMTP TRANSPORTER
// ─────────────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY SMTP CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP configuration error:");
    console.error(error.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SEND EMAIL
// ─────────────────────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!to) {
      throw new Error("Recipient email is required");
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error(
        "SMTP_USER or SMTP_PASS is missing from environment variables",
      );
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 SENDING EMAIL");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📩 To:", to);
    console.log("📌 Subject:", subject);

    const info = await transporter.sendMail({
      from: `"BiteNest" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent successfully");
    console.log("📨 Message ID:", info.messageId);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return info;
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ EMAIL SENDING FAILED");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(error);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    throw new Error(
      `Email could not be sent: ${error.message || "Unknown email error"}`,
    );
  }
};

export { sendEmail };
