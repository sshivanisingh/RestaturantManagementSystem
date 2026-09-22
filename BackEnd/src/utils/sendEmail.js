import axios from "axios";

// ═════════════════════════════════════════════════════════════════════════════
// MAIL RELAY
// Render → HTTPS → Mail Relay → Gmail SMTP
// ═════════════════════════════════════════════════════════════════════════════

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 SENDING EMAIL THROUGH MAIL RELAY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📩 To:", to);
    console.log("📌 Subject:", subject);

    // Validate environment variables
    if (!process.env.MAIL_RELAY_URL) {
      throw new Error("MAIL_RELAY_URL is not configured");
    }

    if (!process.env.MAIL_RELAY_SECRET) {
      throw new Error("MAIL_RELAY_SECRET is not configured");
    }

    const response = await axios.post(
      `${process.env.MAIL_RELAY_URL}/send-email`,
      {
        to,
        subject,
        html,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MAIL_RELAY_SECRET}`,
          "Content-Type": "application/json",
        },

        // 30 seconds
        timeout: 30000,
      },
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📩 To:", to);
    console.log("📨 Message ID:", response.data?.messageId);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return response.data;
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ EMAIL SENDING FAILED");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.error("Message:", error.message);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    }

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    throw new Error(
      error.response?.data?.message ||
        `Email could not be sent: ${error.message}`,
    );
  }
};

export { sendEmail };
