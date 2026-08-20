import nodemailer from "nodemailer";

// ═════════════════════════════════════════════════════════════════════════════
// GMAIL SMTP TRANSPORTER
// ═════════════════════════════════════════════════════════════════════════════

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Connection timeouts
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

// ═════════════════════════════════════════════════════════════════════════════
// SEND EMAIL
// ═════════════════════════════════════════════════════════════════════════════

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 SENDING EMAIL");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📩 To:", to);
    console.log("📌 Subject:", subject);

    // Validate environment variables
    if (!process.env.SMTP_USER) {
      throw new Error("SMTP_USER is not configured");
    }

    if (!process.env.SMTP_PASS) {
      throw new Error("SMTP_PASS is not configured");
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"BiteNest" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📩 To:", to);
    console.log("📨 Message ID:", info.messageId);
    console.log("📡 Response:", info.response);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return info;
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ EMAIL SENDING FAILED");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Message:", error.message);

    if (error.response) {
      console.error("Response:", error.response);
    }

    console.error(error);

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    throw new Error(
      `Email could not be sent: ${error.message || "Unknown email error"}`,
    );
  }
};

export { sendEmail };
