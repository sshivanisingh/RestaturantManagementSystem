import crypto from "crypto";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.payment.model.js";
import { Payment } from "../models/order.payment.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";
import mongoose from "mongoose";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// ─── Email Templates ──────────────────────────────────────────────────────────

const welcomeEmailTemplate = ({
  name,
  email,
  tempPassword,
  activateUrl,
  orderId,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>

  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f9fafb;
      margin: 0;
      padding: 0;
    }

    .wrapper {
      max-width: 560px;
      margin: 40px auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }

    .header {
      background: linear-gradient(135deg, #f97316, #ec4899);
      padding: 36px 32px;
      text-align: center;
    }

    .header h1 {
      color: #fff;
      margin: 0;
      font-size: 26px;
      letter-spacing: -0.5px;
    }

    .header p {
      color: rgba(255,255,255,0.85);
      margin: 8px 0 0;
      font-size: 14px;
    }

    .body {
      padding: 32px;
    }

    .body h2 {
      color: #111827;
      font-size: 20px;
      margin: 0 0 8px;
    }

    .body p {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 16px;
    }

    .creds {
      background: #f3f4f6;
      border-radius: 10px;
      padding: 18px 20px;
      margin: 20px 0;
    }

    .creds p {
      margin: 4px 0;
      color: #374151;
      font-size: 14px;
    }

    .creds strong {
      color: #111827;
    }

    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #f97316, #ec4899);
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      margin: 8px 0;
    }

    .order {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 10px;
      padding: 14px 20px;
      margin: 20px 0;
    }

    .order p {
      margin: 3px 0;
      color: #92400e;
      font-size: 14px;
    }

    .footer {
      background: #f9fafb;
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid #f3f4f6;
    }

    .footer p {
      color: #9ca3af;
      font-size: 12px;
      margin: 0;
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="header">
      <h1>🎉 Welcome Aboard!</h1>
      <p>Your account has been created successfully</p>
    </div>

    <div class="body">

      <h2>Hi ${name}! 👋</h2>

      <p>
        Thank you for your order! We've automatically created an account
        for you so you can track your orders, reorder easily,
        and save your favourites.
      </p>

      <div class="order">
        <p>
          📦 <strong>Order ID:</strong> ${orderId}
        </p>

        <p>
          Your order is being prepared.
          You can track it from your account.
        </p>
      </div>

      <div class="creds">

        <p>
          🔑 <strong>Your Login Credentials</strong>
        </p>

        <p>
          <strong>Email:</strong> ${email}
        </p>

        <p>
          <strong>Temporary Password:</strong>
          <code style="
            background:#e5e7eb;
            padding:2px 6px;
            border-radius:4px;
          ">
            ${tempPassword}
          </code>
        </p>

      </div>

      <p>
        Please set a new password after logging in
        for the first time.
      </p>

      <a href="${activateUrl}" class="btn">
        Activate Account & Set Password
      </a>

      <p style="
        font-size:13px;
        color:#9ca3af;
        margin-top:16px;
      ">
        This link expires in <strong>24 hours</strong>.
        If you didn't place this order,
        please ignore this email.
      </p>

    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} BiteNest ·
        You're receiving this because you placed an order.
      </p>
    </div>

  </div>

</body>
</html>
`;

// ─── Helper: generate temporary password ──────────────────────────────────────

const generateTempPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";

  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

// ─────────────────────────────────────────────────────────────────────────────

class UserService {
  // ─── Cart: Get ─────────────────────────────────────────────────────────────

  static async getCart(userId) {
    const user = await User.findById(userId).populate({
      path: "cart.menuItemId",
      select:
        "name image price discountPercent discountedPrice isAvailable type",
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user.cart;
  }

  // ─── Cart: Add / Update quantity ───────────────────────────────────────────

  static async addToCart(userId, menuItemId, quantity = 1) {
    const item = await MenuItem.findById(menuItemId);

    if (!item || !item.isAvailable) {
      throw new ApiError(404, "Item not available");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const existing = user.cart.find(
      (c) => c.menuItemId.toString() === menuItemId,
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({
        menuItemId,
        quantity,
      });
    }

    await user.save();

    return user.cart;
  }

  // ─── Cart: Update quantity ─────────────────────────────────────────────────

  static async updateCartItem(userId, menuItemId, quantity) {
    if (quantity < 1) {
      throw new ApiError(400, "Quantity must be at least 1");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const item = user.cart.find((c) => c.menuItemId.toString() === menuItemId);

    if (!item) {
      throw new ApiError(404, "Item not in cart");
    }

    item.quantity = quantity;

    await user.save();

    return user.cart;
  }

  // ─── Cart: Remove item ─────────────────────────────────────────────────────

  static async removeFromCart(userId, menuItemId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.cart = user.cart.filter((c) => c.menuItemId.toString() !== menuItemId);

    await user.save();

    return user.cart;
  }

  // ─── Cart: Clear ───────────────────────────────────────────────────────────

  static async clearCart(userId) {
    await User.findByIdAndUpdate(userId, {
      $set: {
        cart: [],
      },
    });

    return {
      message: "Cart cleared",
    };
  }

  // ─── Wishlist: Get ─────────────────────────────────────────────────────────

  static async getWishlist(userId) {
    const user = await User.findById(userId).populate({
      path: "wishlist",
      select:
        "name image price discountPercent discountedPrice type categoryId",
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user.wishlist;
  }

  // ─── Wishlist: Toggle ──────────────────────────────────────────────────────

  static async toggleWishlist(userId, menuItemId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const menuItemObjectId = new mongoose.Types.ObjectId(menuItemId);

    const exists = user.wishlist
      .filter((id) => id !== null)
      .some((id) => id.toString() === menuItemId);

    if (exists) {
      user.wishlist = user.wishlist.filter((id) => {
        if (id === null) {
          return false;
        }

        return id.toString() !== menuItemId;
      });

      await user.save();

      return {
        message: "Removed from wishlist",
        action: "removed",
      };
    }

    user.wishlist.push(menuItemObjectId);

    user.wishlist = user.wishlist.filter((id) => id !== null);

    await user.save();

    return {
      message: "Added to wishlist",
      action: "added",
    };
  }

  // ─── Place Order + Payment + Email ─────────────────────────────────────────

  static async placeOrder(restaurantId, orderData) {
    const { items, deliveryInfo, pricing, paymentMethod, couponCode, notes } =
      orderData;

    // Validate customer email
    if (!deliveryInfo?.email) {
      throw new ApiError(400, "Customer email is required");
    }

    // 1. Create Order
    const order = await Order.create({
      restaurantId,

      items,

      deliveryInfo,

      pricing,

      couponCode,

      notes,

      orderstatus: paymentMethod === "COD" ? "confirmed" : "pending",

      isGuestOrder: true,

      statusHistory: [
        {
          status: paymentMethod === "COD" ? "confirmed" : "pending",

          note: "Order placed",
        },
      ],
    });

    // 2. Create Payment record
    const payment = await Payment.create({
      orderId: order._id,

      restaurantId,

      amount: pricing.total,

      method: paymentMethod,

      status: "pending",

      customerEmail: deliveryInfo.email,

      customerPhone: deliveryInfo.phone,
    });

    // 3. Link payment to order
    order.paymentId = payment._id;

    await order.save();

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Send Order Confirmation Email
    // ─────────────────────────────────────────────────────────────────────────

    try {
      const customerName =
        deliveryInfo.name || deliveryInfo.fullName || "Customer";

      const totalAmount = Number(pricing.total || 0).toFixed(2);

      const paymentStatus =
        paymentMethod === "COD" ? "Confirmed" : "Payment Pending";

      await sendEmail({
        to: deliveryInfo.email,

        subject: `Order Confirmed — BiteNest #${order._id}`,

        html: `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8"/>

  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      max-width: 550px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 32px;
      border: 1px solid #e5e7eb;
    }

    .header {
      text-align: center;
      margin-bottom: 25px;
    }

    .header h1 {
      color: #111827;
      margin: 0 0 8px;
    }

    .header p {
      color: #6b7280;
      margin: 0;
    }

    .success {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
    }

    .success p {
      color: #065f46;
      margin: 0;
    }

    .details {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 10px;
      padding: 18px;
      margin: 20px 0;
    }

    .details p {
      margin: 8px 0;
      color: #374151;
    }

    .total {
      font-size: 20px;
      font-weight: bold;
      color: #ea580c;
    }

    .footer {
      text-align: center;
      margin-top: 25px;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <h1>🎉 Order Confirmed!</h1>

      <p>
        Thank you for ordering from BiteNest.
      </p>
    </div>

    <div class="success">
      <p>
        Hello <strong>${customerName}</strong>,
        your order has been successfully placed.
      </p>
    </div>

    <div class="details">

      <p>
        <strong>Order ID:</strong>
        ${order._id}
      </p>

      <p>
        <strong>Payment Method:</strong>
        ${paymentMethod}
      </p>

      <p>
        <strong>Payment Status:</strong>
        ${paymentStatus}
      </p>

      <p class="total">
        Total: ₹${totalAmount}
      </p>

    </div>

    <p style="
      color:#6b7280;
      font-size:14px;
      line-height:1.6;
    ">
      We have received your order and will keep
      you updated about its status.
    </p>

    <div class="footer">
      © ${new Date().getFullYear()} BiteNest
    </div>

  </div>

</body>

</html>
        `,

        text:
          `Hello ${customerName},\n\n` +
          `Your BiteNest order has been successfully placed.\n\n` +
          `Order ID: ${order._id}\n` +
          `Payment Method: ${paymentMethod}\n` +
          `Payment Status: ${paymentStatus}\n` +
          `Total Amount: ₹${totalAmount}\n\n` +
          `We will keep you updated about your order.\n\n` +
          `© ${new Date().getFullYear()} BiteNest`,
      });

      console.log("✅ Order confirmation email sent successfully");

      console.log("📩 Recipient:", deliveryInfo.email);
    } catch (emailError) {
      // IMPORTANT:
      // Email failure must NOT cancel an already-created order.

      console.error(
        "⚠️ Order created successfully, but confirmation email failed:",
      );

      console.error(emailError?.message || emailError);
    }

    // 5. Return order + payment
    return {
      order,
      payment,
    };
  }

  // ─── COD Payment Confirm ───────────────────────────────────────────────────

  static async confirmCODPayment(paymentId) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    payment.status = "paid";

    payment.paidAt = new Date();

    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, {
      orderstatus: "confirmed",

      $push: {
        statusHistory: {
          status: "confirmed",
          note: "COD confirmed",
        },
      },
    });

    return payment;
  }

  // ─── Online Payment Verify ─────────────────────────────────────────────────

  static async verifyOnlinePayment(paymentId, gatewayData) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    payment.status = "paid";

    payment.paidAt = new Date();

    payment.transactionId = gatewayData.transactionId;

    payment.gatewayOrderId = gatewayData.gatewayOrderId;

    payment.gatewayResponse = gatewayData.raw;

    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, {
      orderstatus: "confirmed",

      $push: {
        statusHistory: {
          status: "confirmed",
          note: "Online payment verified",
        },
      },
    });

    return payment;
  }

  // ─── Activate Account ──────────────────────────────────────────────────────

  static async activateAccount(rawToken, newPassword) {
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      accountActivateToken: hashed,

      accountActivateExpiry: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      throw new ApiError(400, "Activation link invalid or expired");
    }

    user.password = newPassword;

    user.isActive = true;

    user.isEmailVerified = true;

    user.accountActivateToken = undefined;

    user.accountActivateExpiry = undefined;

    await user.save();

    return {
      message: "Account activated! You can now login.",
    };
  }

  // ─── User Login ────────────────────────────────────────────────────────────

  static async login(email, password, res) {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(404, "No account found with this email");
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        "Please activate your account first. Check your email.",
      );
    }

    const isValid = await user.isPasswordCorrect(password);

    if (!isValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    const { password: _, refreshToken: __, ...safeData } = user.toObject();

    return {
      user: safeData,
      accessToken,
    };
  }

  // ─── User Logout ───────────────────────────────────────────────────────────

  static async logout(userId, res) {
    await User.findByIdAndUpdate(userId, {
      $unset: {
        refreshToken: 1,
      },
    });

    res.clearCookie("accessToken", cookieOptions);

    res.clearCookie("refreshToken", cookieOptions);

    return {
      message: "Logged out successfully",
    };
  }

  // ─── Get Orders ────────────────────────────────────────────────────────────

  static async getMyOrders(userId) {
    const user = await User.findById(userId).populate({
      path: "orders",

      populate: {
        path: "paymentId",
        select: "status method amount paidAt",
      },

      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user.orders;
  }

  // ─── Get Profile ───────────────────────────────────────────────────────────

  static async getProfile(userId) {
    const MenuItem = mongoose.model("MenuItem");

    const user = await User.findById(userId)
      .select(
        "-password -refreshToken -resetPasswordToken -accountActivateToken",
      )
      .populate({
        path: "cart.menuItemId",

        model: MenuItem,

        select: "name price description image category isAvailable",
      })
      .populate({
        path: "wishlist",

        model: MenuItem,

        select: "name price description image category isAvailable",
      });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.cart) {
      user.cart = user.cart.filter((item) => item.menuItemId !== null);
    }

    if (user.wishlist) {
      user.wishlist = user.wishlist.filter((item) => item !== null);
    }

    return user;
  }

  // ─── Update Profile ─────────────────────────────────────────────────────────

  static async updateProfile(userId, data) {
    const { name, phone, addresses } = data;

    const user = await User.findByIdAndUpdate(
      userId,

      {
        $set: {
          name,
          phone,
          ...(addresses && {
            addresses,
          }),
        },
      },

      {
        new: true,
      },
    ).select("-password -refreshToken");

    return user;
  }

  // ─── Change Password ───────────────────────────────────────────────────────

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isMatch = await user.isPasswordCorrect(currentPassword);

    if (!isMatch) {
      throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      message: "Password changed successfully",
    };
  }
}

export { UserService, cookieOptions };
