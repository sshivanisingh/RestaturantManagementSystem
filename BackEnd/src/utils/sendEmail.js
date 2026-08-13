import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Send Email ───────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log("📧 Sending email...");
    console.log("   To:", to);
    console.log("   Subject:", subject);

    const { data, error } = await resend.emails.send({
      from: "BiteNest <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("❌ Resend email error:");
      console.error(error);

      throw new Error(error.message || "Email could not be sent");
    }

    console.log("✅ Email sent successfully");
    console.log("   Resend ID:", data?.id);

    return data;
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error(error);

    throw new Error(
      `Email could not be sent: ${error.message || "Unknown email error"}`,
    );
  }
};

export { sendEmail };
