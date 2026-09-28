import axios from "axios";

// ═════════════════════════════════════════════════════════════════════════════
// MAIL RELAY
// Backend → HTTPS → Mail Relay → Gmail SMTP
// ═════════════════════════════════════════════════════════════════════════════

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 SENDING EMAIL THROUGH MAIL RELAY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("📩 To:", to);
    console.log("📌 Subject:", subject);
    console.log("📎 Attachments:", attachments.length);

    if (!process.env.MAIL_RELAY_URL) {
      throw new Error("MAIL_RELAY_URL is not configured");
    }

    if (!process.env.MAIL_RELAY_SECRET) {
      throw new Error("MAIL_RELAY_SECRET is not configured");
    }

    // ═════════════════════════════════════════════════════════════════════════
    // PROCESS ATTACHMENTS
    // ═════════════════════════════════════════════════════════════════════════

    const processedAttachments = attachments.map((attachment) => {
      let content;

      // Buffer → Base64
      if (Buffer.isBuffer(attachment.content)) {
        content = attachment.content.toString("base64");
      }

      // String
      else if (typeof attachment.content === "string") {
        content = attachment.content;
      }

      // File path
      else if (attachment.path) {
        const fs = require("fs");

        content = fs.readFileSync(attachment.path).toString("base64");
      } else {
        throw new Error(`Invalid attachment content: ${attachment.filename}`);
      }

      return {
        filename: attachment.filename,

        content,

        encoding: "base64",

        contentType: attachment.contentType || "application/octet-stream",

        ...(attachment.cid
          ? {
              cid: attachment.cid,
            }
          : {}),
      };
    });

    // ═════════════════════════════════════════════════════════════════════════
    // SEND REQUEST TO NETLIFY
    // ═════════════════════════════════════════════════════════════════════════

    const response = await axios.post(
      `${process.env.MAIL_RELAY_URL}/send-email`,
      {
        to,
        subject,
        html,
        text,
        attachments: processedAttachments,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MAIL_RELAY_SECRET}`,

          "Content-Type": "application/json",
        },

        timeout: 30000,
      },
    );

    // ═════════════════════════════════════════════════════════════════════════
    // SUCCESS
    // ═════════════════════════════════════════════════════════════════════════

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("📩 To:", to);

    console.log("📨 Message ID:", response.data?.messageId);

    if (processedAttachments.length > 0) {
      console.log(
        "📎 Attachments:",
        processedAttachments
          .map((attachment) => attachment.filename)
          .join(", "),
      );
    }

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
