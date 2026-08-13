// ─── OTP Verification ────────────────────────────
const otpEmailTemplate = (name, otp) => ({
  subject: `${otp} — Email Verify OTP`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
      <h2 style="margin:0 0 8px">Hello, ${name} 👋</h2>
      <p style="color:#6b7280">Apna email verify karne ke liye yeh OTP use karo:</p>
      <div style="font-size:36px;font-weight:700;letter-spacing:8px;
                  color:#4f46e5;margin:24px 0;">${otp}</div>
      <p style="color:#9ca3af;font-size:13px;">
        Yeh OTP <strong>10 minute</strong> mein expire hoga.<br/>
        Agar aapne request nahi ki toh ignore karo.
      </p>
    </div>`,
  text: `Hello ${name}, Tumhara OTP hai: ${otp} (10 min valid)`,
});

// ─── Password Reset ───────────────────────────────
const resetPasswordTemplate = (name, resetUrl) => ({
  subject: "Password Reset Request",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
      <h2 style="margin:0 0 8px">Password Reset 🔐</h2>
      <p style="color:#6b7280">Hi ${name}, neeche click karke password reset karo:</p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:12px 28px;background:#dc2626;
                color:#fff;border-radius:6px;text-decoration:none;
                font-weight:bold;margin:20px 0;">
        Reset Password
      </a>
      <p style="color:#9ca3af;font-size:13px;">
        Yeh link <strong>15 minute</strong> mein expire hoga.<br/>
        Agar aapne request nahi ki toh ignore karo.
      </p>
    </div>`,
  text: `Hi ${name}, reset link: ${resetUrl}`,
});

export { otpEmailTemplate, resetPasswordTemplate };