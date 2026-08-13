import nodemailer from "nodemailer";

// ─── SMTP Transporter ─────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,

  // Gmail:
  // 587 → STARTTLS
  // 465 → SSL
  secure: Number(process.env.SMTP_PORT) === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Useful for diagnosing SMTP connection problems
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// ─── Verify SMTP configuration when server starts ─────────────────────────────

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:");
    console.error(error);
  } else {
    console.log("✅ SMTP server is ready:", success);
  }
});

// ─── Send Email ───────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log("📧 Sending email...");
    console.log("   To:", to);
    console.log("   Subject:", subject);
    console.log("   SMTP Host:", process.env.SMTP_HOST);
    console.log("   SMTP Port:", process.env.SMTP_PORT);
    console.log("   SMTP User:", process.env.SMTP_USER);

    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "BiteNest"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent successfully");
    console.log("   Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error(error);

    throw new Error(
      `Email could not be sent: ${error.message || "Unknown SMTP error"}`,
    );
  }
};

export { sendEmail };
