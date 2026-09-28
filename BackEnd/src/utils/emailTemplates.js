// ============================================================================
// Bitenest Email Templates
// ============================================================================

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
// INVOICE EMAIL
// ─────────────────────────────────────────────────────────────────────────────

const invoiceEmailTemplate = (invoice) => {
  // Safely format currency
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  // Generate invoice item rows
  const itemsHtml = (invoice.items || [])
    .map(
      (item) => `
        <tr>

          <td style="
            padding: 12px 10px;
            border-bottom: 1px solid #eeeeee;
            color: #333333;
            font-size: 14px;
          ">
            ${item.name || "Item"}
          </td>

          <td style="
            padding: 12px 10px;
            border-bottom: 1px solid #eeeeee;
            text-align: center;
            color: #333333;
            font-size: 14px;
          ">
            ${item.quantity || 0}
          </td>

          <td style="
            padding: 12px 10px;
            border-bottom: 1px solid #eeeeee;
            text-align: right;
            color: #333333;
            font-size: 14px;
          ">
            ${formatCurrency(item.unitPrice)}
          </td>

          <td style="
            padding: 12px 10px;
            border-bottom: 1px solid #eeeeee;
            text-align: right;
            color: #333333;
            font-size: 14px;
            font-weight: 600;
          ">
            ${formatCurrency(item.total)}
          </td>

        </tr>
      `,
    )
    .join("");

  return {
    subject: `BiteNest — Invoice ${invoice.invoiceNumber}`,

    html: `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>BiteNest Invoice</title>

</head>

<body style="
  margin: 0;
  padding: 0;
  background: #f4f4f4;
  font-family: Arial, Helvetica, sans-serif;
  color: #222222;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    background: #f4f4f4;
    padding: 30px 10px;
  "
>

<tr>

<td align="center">

<table
  width="700"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    max-width: 700px;
    width: 100%;
    background: #ffffff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 3px 15px rgba(0,0,0,0.08);
  "
>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- HEADER / LOGO -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td
  align="center"
  style="
    background: #111111;
    padding: 25px 20px;
  "
>

<img
  src="cid:bitenest-logo"
  alt="BiteNest"
  width="280"
  style="
    display: block;
    width: 280px;
    max-width: 90%;
    height: auto;
    margin: auto;
  "
>

</td>

</tr>


<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- INVOICE HEADER -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td style="
  padding: 30px 35px 10px 35px;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
>

<tr>

<td valign="top">

<h1 style="
  margin: 0;
  font-size: 28px;
  color: #222222;
">
  INVOICE
</h1>

<p style="
  margin: 8px 0 0 0;
  color: #777777;
  font-size: 14px;
">
  ${invoice.invoiceNumber || "-"}
</p>

</td>


<td
  valign="top"
  align="right"
>

<strong style="
  font-size: 18px;
  color: #222222;
">
  ${invoice.restaurant?.name || "BiteNest"}
</strong>

${
  invoice.restaurant?.address
    ? `
      <p style="
        margin: 6px 0 0 0;
        color: #777777;
        font-size: 13px;
        line-height: 20px;
      ">
        ${invoice.restaurant.address}
      </p>
    `
    : ""
}

${
  invoice.restaurant?.phone
    ? `
      <p style="
        margin: 3px 0;
        color: #777777;
        font-size: 13px;
      ">
        ${invoice.restaurant.phone}
      </p>
    `
    : ""
}

${
  invoice.restaurant?.email
    ? `
      <p style="
        margin: 3px 0;
        color: #777777;
        font-size: 13px;
      ">
        ${invoice.restaurant.email}
      </p>
    `
    : ""
}

</td>

</tr>

</table>

</td>

</tr>


<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- DIVIDER -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td style="padding: 0 35px;">

<div style="
  height: 1px;
  background: #eeeeee;
"></div>

</td>

</tr>


<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- CUSTOMER + ORDER DETAILS -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td style="
  padding: 25px 35px;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
>

<tr>

<!-- CUSTOMER -->

<td
  width="50%"
  valign="top"
>

<p style="
  margin: 0 0 10px 0;
  color: #888888;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
">
  Bill To
</p>

<p style="
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
  color: #222222;
">
  ${invoice.customer?.name || "Guest"}
</p>

${
  invoice.customer?.email
    ? `
      <p style="
        margin: 4px 0;
        color: #666666;
        font-size: 13px;
      ">
        ${invoice.customer.email}
      </p>
    `
    : ""
}

${
  invoice.customer?.phone
    ? `
      <p style="
        margin: 4px 0;
        color: #666666;
        font-size: 13px;
      ">
        ${invoice.customer.phone}
      </p>
    `
    : ""
}

${
  invoice.customer?.address
    ? `
      <p style="
        margin: 4px 0;
        color: #666666;
        font-size: 13px;
        line-height: 19px;
      ">
        ${invoice.customer.address}
      </p>
    `
    : ""
}

</td>


<!-- ORDER DETAILS -->

<td
  width="50%"
  valign="top"
  align="right"
>

<p style="
  margin: 0 0 10px 0;
  color: #888888;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
">
  Order Details
</p>

<p style="
  margin: 4px 0;
  color: #555555;
  font-size: 13px;
">
  <strong>Order ID:</strong>
  ${invoice.orderId || "-"}
</p>

<p style="
  margin: 4px 0;
  color: #555555;
  font-size: 13px;
">
  <strong>Invoice Date:</strong>
  ${invoice.invoiceDate || "-"}
</p>

<p style="
  margin: 4px 0;
  color: #555555;
  font-size: 13px;
">
  <strong>Order Date:</strong>
  ${invoice.orderDate || "-"}
</p>

</td>

</tr>

</table>

</td>

</tr>


<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- ITEMS -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td style="
  padding: 0 35px;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    border-collapse: collapse;
    border: 1px solid #eeeeee;
    border-radius: 8px;
    overflow: hidden;
  "
>

<thead>

<tr style="
  background: #111111;
  color: #ffffff;
">

<th
  align="left"
  style="
    padding: 13px 10px;
    font-size: 12px;
    text-transform: uppercase;
  "
>
  Item
</th>

<th
  align="center"
  style="
    padding: 13px 10px;
    font-size: 12px;
    text-transform: uppercase;
  "
>
  Qty
</th>

<th
  align="right"
  style="
    padding: 13px 10px;
    font-size: 12px;
    text-transform: uppercase;
  "
>
  Price
</th>

<th
  align="right"
  style="
    padding: 13px 10px;
    font-size: 12px;
    text-transform: uppercase;
  "
>
  Total
</th>

</tr>

</thead>

<tbody>

${itemsHtml}

</tbody>

</table>

</td>

</tr>


<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- TOTALS -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td style="
  padding: 25px 35px 10px 35px;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
>

<tr>

<td
  align="right"
  style="
    padding: 5px 0;
    color: #666666;
    font-size: 14px;
  "
>
  Subtotal
</td>

<td
  width="130"
  align="right"
  style="
    padding: 5px 0;
    color: #333333;
    font-size: 14px;
  "
>
  ${formatCurrency(invoice.subtotal)}
</td>

</tr>


<tr>

<td
  align="right"
  style="
    padding: 5px 0;
    color: #666666;
    font-size: 14px;
  "
>
  Tax
</td>

<td
  align="right"
  style="
    padding: 5px 0;
    color: #333333;
    font-size: 14px;
  "
>
  ${formatCurrency(invoice.tax)}
</td>

</tr>


<tr>

<td
  align="right"
  style="
    padding: 5px 0;
    color: #666666;
    font-size: 14px;
  "
>
  Delivery Charge
</td>

<td
  align="right"
  style="
    padding: 5px 0;
    color: #333333;
    font-size: 14px;
  "
>
  ${formatCurrency(invoice.deliveryCharge)}
</td>

</tr>


<tr>

<td
  align="right"
  style="
    padding: 5px 0;
    color: #666666;
    font-size: 14px;
  "
>
  Discount
</td>

<td
  align="right"
  style="
    padding: 5px 0;
    color: #333333;
    font-size: 14px;
  "
>
  -${formatCurrency(invoice.discount)}
</td>

</tr>


<!-- GRAND TOTAL -->

<tr>

<td
  align="right"
  style="
    padding: 15px 0 5px 0;
    border-top: 2px solid #222222;
    font-size: 18px;
    font-weight: bold;
  "
>
  Grand Total
</td>

<td
  align="right"
  style="
    padding: 15px 0 5px 0;
    border-top: 2px solid #222222;
    font-size: 20px;
    font-weight: bold;
    color: #f97316;
  "
>
  ${formatCurrency(invoice.total)}
</td>

</tr>

</table>

</td>

</tr>


<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- PAYMENT -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td style="
  padding: 20px 35px;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    background: #f8f8f8;
    border-radius: 8px;
  "
>

<tr>

<td style="
  padding: 15px;
  font-size: 13px;
  color: #555555;
">

<strong style="color: #222222;">
  Payment Method:
</strong>

${invoice.paymentMethod || "Not specified"}

</td>


<td
  align="right"
  style="
    padding: 15px;
    font-size: 13px;
    color: #555555;
  "
>

<strong style="color: #222222;">
  Payment Status:
</strong>

${invoice.paymentStatus || "Pending"}

</td>

</tr>

</table>

</td>

</tr>


<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- THANK YOU -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td
  align="center"
  style="
    padding: 10px 35px 30px 35px;
  "
>

<h3 style="
  margin: 0 0 8px 0;
  color: #222222;
  font-size: 18px;
">
  Thank you for ordering with BiteNest!
</h3>

<p style="
  margin: 0;
  color: #777777;
  font-size: 13px;
  line-height: 20px;
">
  We hope you enjoyed your meal.
</p>

</td>

</tr>


<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- FOOTER -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<tr>

<td
  align="center"
  style="
    background: #111111;
    padding: 20px;
  "
>

<p style="
  margin: 0;
  color: #aaaaaa;
  font-size: 12px;
">
  © ${new Date().getFullYear()} BiteNest.
  All rights reserved.
</p>

<p style="
  margin: 6px 0 0 0;
  color: #777777;
  font-size: 11px;
">
  This is an automatically generated invoice.
</p>

</td>

</tr>


</table>

</td>

</tr>

</table>

</body>
</html>
    `,

    // ───────────────────────────────────────────────────────────────────────
    // PLAIN TEXT VERSION
    // ───────────────────────────────────────────────────────────────────────

    text: `
BiteNest
========================================

INVOICE

Invoice Number: ${invoice.invoiceNumber || "-"}
Invoice Date: ${invoice.invoiceDate || "-"}
Order Date: ${invoice.orderDate || "-"}
Order ID: ${invoice.orderId || "-"}

CUSTOMER
----------------------------------------
Name: ${invoice.customer?.name || "Guest"}
Email: ${invoice.customer?.email || "-"}
Phone: ${invoice.customer?.phone || "-"}

ITEMS
----------------------------------------
${(invoice.items || [])
  .map(
    (item) => `${item.name} × ${item.quantity} = ${formatCurrency(item.total)}`,
  )
  .join("\n")}

----------------------------------------

Subtotal:         ${formatCurrency(invoice.subtotal)}
Tax:              ${formatCurrency(invoice.tax)}
Delivery Charge:  ${formatCurrency(invoice.deliveryCharge)}
Discount:         -${formatCurrency(invoice.discount)}

----------------------------------------
TOTAL:            ${formatCurrency(invoice.total)}

Payment Method: ${invoice.paymentMethod || "Not specified"}
Payment Status: ${invoice.paymentStatus || "Pending"}

========================================

Thank you for ordering with BiteNest!

© ${new Date().getFullYear()} BiteNest.
All rights reserved.
    `.trim(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  otpEmailTemplate,
  resetPasswordTemplate,
  orderConfirmationTemplate,
  invoiceEmailTemplate,
};
