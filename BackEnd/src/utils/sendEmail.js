import nodemailer from "nodemailer";

// ─── Transporter (ek baar banao, reuse karo) ──────
const transporter = nodemailer.createTransport({
  host    : process.env.SMTP_HOST,
  port    : process.env.SMTP_PORT,
  secure  : process.env.SMTP_PORT == 465, // 465 = SSL, 587 = TLS
  auth: {
    user : process.env.SMTP_USER,
    pass : process.env.SMTP_PASS,
  },
});

// ─── Main Send Function ───────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from    : `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,   // fallback if HTML not supported
    });

    return info;

  } catch (error) {
    throw new Error("Email could not be sent");
  }
};

export { sendEmail };