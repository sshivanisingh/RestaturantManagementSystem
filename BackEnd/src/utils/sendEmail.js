import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────────────────────
// Gmail Transporter
// ─────────────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Verify Gmail connection
// ─────────────────────────────────────────────────────────────────────────────

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Gmail SMTP verification failed:");
    console.error(error);
  } else {
    console.log("✅ Gmail SMTP server is ready");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Send Email
// ─────────────────────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html, text }) => {
  try {
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

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("📨 Message ID:", info.messageId);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return info;
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ EMAIL SENDING FAILED");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Message:", error.message);

    console.error(error);

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    throw new Error(
      `Email could not be sent: ${error.message || "Unknown email error"}`,
    );
  }
};

export { sendEmail };
