// ─────────────────────────────────────────────────────────────────────────────
// OTP VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

const otpEmailTemplate = (name, otp) => ({
  subject: `${otp} — BiteNest Email Verification OTP`,

  html: `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 480px;
      margin: 40px auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 32px;
    ">

      <h2 style="
        margin: 0 0 12px;
        color: #111827;
      ">
        Hello, ${name} 👋
      </h2>

      <p style="
        color: #6b7280;
        font-size: 15px;
        line-height: 1.6;
      ">
        Use the following OTP to verify your BiteNest email address:
      </p>

      <div style="
        font-size: 36px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #4f46e5;
        margin: 24px 0;
      ">
        ${otp}
      </div>

      <p style="
        color: #6b7280;
        font-size: 14px;
        line-height: 1.6;
      ">
        This OTP will expire in
        <strong>10 minutes</strong>.
      </p>

      <p style="
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.6;
      ">
        If you did not request this verification code,
        you can safely ignore this email.
      </p>

    </div>
  `,

  text: `
Hello ${name},

Your BiteNest email verification OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request this verification code,
you can safely ignore this email.
  `.trim(),
});

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────────────────────────────────────────

const resetPasswordTemplate = (name, resetUrl) => ({
  subject: "BiteNest — Password Reset Request",

  html: `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 480px;
      margin: 40px auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 32px;
    ">

      <h2 style="
        margin: 0 0 12px;
        color: #111827;
      ">
        Password Reset 🔐
      </h2>

      <p style="
        color: #6b7280;
        font-size: 15px;
        line-height: 1.6;
      ">
        Hello ${name},
      </p>

      <p style="
        color: #6b7280;
        font-size: 15px;
        line-height: 1.6;
      ">
        We received a request to reset your BiteNest account password.
        Click the button below to create a new password.
      </p>

      <a
        href="${resetUrl}"
        style="
          display: inline-block;
          padding: 12px 28px;
          background: #dc2626;
          color: #ffffff;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          margin: 20px 0;
        "
      >
        Reset Password
      </a>

      <p style="
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.6;
      ">
        This password reset link will expire in
        <strong>15 minutes</strong>.
      </p>

      <p style="
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.6;
      ">
        If you did not request a password reset,
        you can safely ignore this email.
      </p>

    </div>
  `,

  text: `
Hello ${name},

We received a request to reset your BiteNest account password.

Reset your password using the following link:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset,
you can safely ignore this email.
  `.trim(),
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDER CONFIRMATION + NEW ACCOUNT
// ─────────────────────────────────────────────────────────────────────────────

const orderConfirmationTemplate = ({
  name,
  orderId,
  total,
  paymentMethod,
  isNewUser,
  email,
  tempPassword,
  loginUrl,
}) => ({
  subject: isNewUser
    ? `BiteNest — Order Confirmed & Welcome! #${orderId}`
    : `BiteNest — Order Confirmed #${orderId}`,

  html: `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 32px;
    ">

      <h1 style="
        margin: 0 0 12px;
        color: #111827;
      ">
        🎉 Order Confirmed!
      </h1>

      <p style="
        color: #374151;
        font-size: 16px;
      ">
        Hello <strong>${name}</strong>,
      </p>

      <p style="
        color: #6b7280;
        font-size: 15px;
        line-height: 1.6;
      ">
        Thank you for ordering from BiteNest.
        Your order has been successfully placed.
      </p>

      <!-- ORDER DETAILS -->

      <div style="
        background: #fff7ed;
        border: 1px solid #fed7aa;
        border-radius: 10px;
        padding: 20px;
        margin: 24px 0;
      ">

        <h3 style="
          margin: 0 0 15px;
          color: #9a3412;
        ">
          Order Details
        </h3>

        <p style="
          margin: 8px 0;
          color: #374151;
        ">
          <strong>Order ID:</strong>
          ${orderId}
        </p>

        <p style="
          margin: 8px 0;
          color: #374151;
        ">
          <strong>Payment Method:</strong>
          ${paymentMethod}
        </p>

        <p style="
          margin: 8px 0;
          color: #374151;
        ">
          <strong>Total Amount:</strong>
          ₹${total}
        </p>

      </div>

      ${
        isNewUser
          ? `
        <!-- NEW ACCOUNT -->

        <div style="
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          padding: 20px;
          margin: 24px 0;
        ">

          <h3 style="
            margin: 0 0 12px;
            color: #1e3a8a;
          ">
            🔐 Your BiteNest Account
          </h3>

          <p style="
            color: #374151;
            line-height: 1.6;
          ">
            We have created a BiteNest account for you so that
            you can track your orders and manage your account.
          </p>

          <p style="
            margin: 8px 0;
            color: #374151;
          ">
            <strong>Email:</strong>
            ${email}
          </p>

          <p style="
            margin: 8px 0;
            color: #374151;
          ">
            <strong>Temporary Password:</strong>
            ${tempPassword}
          </p>

          <a
            href="${loginUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background: #f97316;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 12px;
            "
          >
            Login to BiteNest
          </a>

          <p style="
            color: #6b7280;
            font-size: 13px;
            line-height: 1.6;
            margin-top: 16px;
          ">
            For your security, please change your password
            after your first login.
          </p>

        </div>
      `
          : `
        <!-- EXISTING ACCOUNT -->

        <p style="
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        ">
          You can log in to your existing BiteNest account
          to track your order and manage your account.
        </p>
      `
      }

      <p style="
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.6;
        margin-top: 28px;
      ">
        Thank you for choosing BiteNest.
      </p>

    </div>
  `,

  text: `
Hello ${name},

Thank you for ordering from BiteNest.

Your order has been successfully placed.

Order Details
--------------
Order ID: ${orderId}
Payment Method: ${paymentMethod}
Total Amount: ₹${total}

${
  isNewUser
    ? `
Your BiteNest account has also been created.

Login Email: ${email}
Temporary Password: ${tempPassword}

Login:
${loginUrl}

For your security, please change your password after your first login.
`
    : `
You can log in to your existing BiteNest account to track your order.
`
}

Thank you for choosing BiteNest.
  `.trim(),
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export { otpEmailTemplate, resetPasswordTemplate, orderConfirmationTemplate };
