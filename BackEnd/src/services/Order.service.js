import Razorpay from "razorpay";
import crypto from "crypto";

import { Order } from "../models/order.payment.model.js";
import { Payment } from "../models/order.payment.model.js";
import { User } from "../models/user.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";

// ═════════════════════════════════════════════════════════════════════════════
// RAZORPAY
// ═════════════════════════════════════════════════════════════════════════════

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ═════════════════════════════════════════════════════════════════════════════
// TEMPORARY PASSWORD
// ═════════════════════════════════════════════════════════════════════════════

const generateTempPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";

  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

// ═════════════════════════════════════════════════════════════════════════════
// ORDER CONFIRMATION EMAIL — NEW USER
// ═════════════════════════════════════════════════════════════════════════════

const newUserOrderEmailTemplate = ({
  name,
  email,
  tempPassword,
  loginUrl,
  orderId,
  total,
  paymentMethod,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    .header {
      background: linear-gradient(135deg, #f97316, #ec4899);
      padding: 35px 25px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 26px;
    }

    .header p {
      color: #ffffff;
      opacity: 0.9;
      margin: 8px 0 0;
      font-size: 14px;
    }

    .content {
      padding: 32px;
    }

    .content h2 {
      color: #111827;
      margin-top: 0;
    }

    .content p {
      color: #6b7280;
      line-height: 1.6;
      font-size: 15px;
    }

    .order-box {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 10px;
      padding: 18px;
      margin: 22px 0;
    }

    .order-box p {
      margin: 7px 0;
      color: #92400e;
    }

    .account-box {
      background: #f3f4f6;
      border-radius: 10px;
      padding: 20px;
      margin: 22px 0;
    }

    .account-box h3 {
      margin-top: 0;
      color: #111827;
    }

    .account-box p {
      margin: 8px 0;
      color: #374151;
    }

    .password {
      display: inline-block;
      background: #e5e7eb;
      padding: 5px 10px;
      border-radius: 5px;
      font-family: monospace;
      font-weight: bold;
      color: #111827;
    }

    .button {
      display: inline-block;
      background: linear-gradient(135deg, #f97316, #ec4899);
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 7px;
      font-weight: bold;
      margin: 15px 0;
    }

    .footer {
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 20px;
      text-align: center;
    }

    .footer p {
      margin: 0;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <h1>🎉 Order Confirmed!</h1>
      <p>Welcome to BiteNest</p>
    </div>

    <div class="content">

      <h2>Hello ${name}! 👋</h2>

      <p>
        Thank you for placing your order with BiteNest.
        Your order has been successfully confirmed.
      </p>

      <div class="order-box">

        <p>
          <strong>Order ID:</strong>
          ${orderId}
        </p>

        <p>
          <strong>Total Amount:</strong>
          ₹${Number(total || 0).toFixed(2)}
        </p>

        <p>
          <strong>Payment Method:</strong>
          ${paymentMethod || "COD"}
        </p>

        <p>
          Your order is now being prepared.
        </p>

      </div>

      <p>
        We have also created a BiteNest account for you automatically.
        You can use your account to track your orders, view your order
        history, and reorder your favorite food.
      </p>

      <div class="account-box">

        <h3>🔐 Your BiteNest Account</h3>

        <p>
          <strong>Email:</strong>
          ${email}
        </p>

        <p>
          <strong>Temporary Password:</strong>
          <span class="password">${tempPassword}</span>
        </p>

      </div>

      <p>
        You can log in immediately using the credentials above.
        We strongly recommend changing your password after your first login.
      </p>

      <div style="text-align:center;">

        <a href="${loginUrl}" class="button">
          Login to BiteNest
        </a>

      </div>

      <p style="font-size:13px;color:#9ca3af;">
        If you did not place this order, please contact BiteNest support
        immediately.
      </p>

    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} BiteNest. All rights reserved.
      </p>
    </div>

  </div>

</body>
</html>
`;

// ═════════════════════════════════════════════════════════════════════════════
// ORDER CONFIRMATION EMAIL — EXISTING USER
// ═════════════════════════════════════════════════════════════════════════════

const existingUserOrderEmailTemplate = ({
  name,
  orderId,
  total,
  paymentMethod,
  loginUrl,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    .header {
      background: linear-gradient(135deg, #f97316, #ec4899);
      padding: 35px 25px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 26px;
    }

    .content {
      padding: 32px;
    }

    .content h2 {
      color: #111827;
      margin-top: 0;
    }

    .content p {
      color: #6b7280;
      line-height: 1.6;
      font-size: 15px;
    }

    .order-box {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 10px;
      padding: 18px;
      margin: 22px 0;
    }

    .order-box p {
      margin: 7px 0;
      color: #92400e;
    }

    .button {
      display: inline-block;
      background: linear-gradient(135deg, #f97316, #ec4899);
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 7px;
      font-weight: bold;
      margin: 15px 0;
    }

    .footer {
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 20px;
      text-align: center;
    }

    .footer p {
      margin: 0;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <h1>🎉 Order Confirmed!</h1>
    </div>

    <div class="content">

      <h2>Hello ${name}! 👋</h2>

      <p>
        Thank you for ordering from BiteNest.
        Your order has been successfully confirmed.
      </p>

      <div class="order-box">

        <p>
          <strong>Order ID:</strong>
          ${orderId}
        </p>

        <p>
          <strong>Total Amount:</strong>
          ₹${Number(total || 0).toFixed(2)}
        </p>

        <p>
          <strong>Payment Method:</strong>
          ${paymentMethod || "COD"}
        </p>

        <p>
          Your order is now being prepared.
        </p>

      </div>

      <p>
        You can track your order and view your order history from
        your BiteNest account.
      </p>

      <div style="text-align:center;">

        <a href="${loginUrl}" class="button">
          View My Orders
        </a>

      </div>

    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} BiteNest. All rights reserved.
      </p>
    </div>

  </div>

</body>
</html>
`;

// ═════════════════════════════════════════════════════════════════════════════
// ORDER SERVICE
// ═════════════════════════════════════════════════════════════════════════════

class OrderService {
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1 — CREATE ORDER
  // ═══════════════════════════════════════════════════════════════════════════

  static async createOrder(orderData) {
    const {
      items,
      deliveryInfo,
      paymentMethod,
      couponCode,
      notes,
      restaurantId,
      customerLocation,
    } = orderData;

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    if (!deliveryInfo) {
      throw new ApiError(400, "Delivery information is required");
    }

    if (!deliveryInfo.name?.trim()) {
      throw new ApiError(400, "Delivery name is required");
    }

    if (!deliveryInfo.phone?.trim()) {
      throw new ApiError(400, "Delivery phone is required");
    }

    if (!deliveryInfo.address?.trim()) {
      throw new ApiError(400, "Delivery address is required");
    }

    if (!deliveryInfo.city?.trim()) {
      throw new ApiError(400, "Delivery city is required");
    }

    if (!deliveryInfo.pincode?.trim()) {
      throw new ApiError(400, "Delivery pincode is required");
    }

    const menuItemIds = items.map((item) => {
      const id = item.menuItemId || item.id || item._id;

      if (!id) {
        throw new ApiError(400, "Cart item is missing menu item ID");
      }

      return id.toString();
    });

    const dbItems = await MenuItem.find({
      _id: {
        $in: menuItemIds,
      },
      isActive: true,
    });

    if (dbItems.length === 0) {
      throw new ApiError(
        400,
        "No valid menu items found. Please refresh your cart.",
      );
    }

    const verifiedItems = items.map((reqItem) => {
      const requestedId = (
        reqItem.menuItemId ||
        reqItem.id ||
        reqItem._id
      )?.toString();

      const dbItem = dbItems.find(
        (item) => item._id.toString() === requestedId,
      );

      if (!dbItem) {
        throw new ApiError(
          400,
          `Menu item not found or unavailable: ${requestedId}`,
        );
      }

      const quantity = Number(reqItem.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, `Invalid quantity for ${dbItem.name}`);
      }

      const price = Number(dbItem.discountedPrice ?? dbItem.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new ApiError(400, `Invalid price for ${dbItem.name}`);
      }

      return {
        menuItemId: dbItem._id,
        name: dbItem.name,
        image: dbItem.image || "",
        price,
        quantity,
      };
    });

    const subtotal = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const tax = Math.round(subtotal * 0.05);

    const deliveryCharge =
      deliveryInfo.type === "pickup" ? 0 : subtotal >= 500 ? 0 : 40;

    const discount = 0;

    const total = subtotal + tax + deliveryCharge - discount;

    const pricing = {
      subtotal,
      tax,
      deliveryCharge,
      discount,
      total,
    };

    const order = await Order.create({
      items: verifiedItems,

      deliveryInfo: {
        name: deliveryInfo.name.trim(),

        phone: deliveryInfo.phone.trim(),

        email: deliveryInfo.email?.trim().toLowerCase() || null,

        address: deliveryInfo.address.trim(),

        city: deliveryInfo.city.trim(),

        state: deliveryInfo.state?.trim() || null,

        pincode: deliveryInfo.pincode.trim(),

        type: deliveryInfo.type === "pickup" ? "pickup" : "delivery",
      },

      customerLocation: customerLocation?.coordinates
        ? {
            type: "Point",
            coordinates: customerLocation.coordinates,
          }
        : undefined,

      restaurantId: restaurantId || null,

      pricing,

      paymentMethod: paymentMethod || "COD",

      couponCode: couponCode || null,

      notes: notes || null,

      orderstatus: "pending",

      deliverystatus: "pending",

      isGuestOrder: true,

      statusHistory: [
        {
          status: "pending",
          note: "Order initiated",
        },
      ],
    });

    return {
      order,
      pricing,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2A — INITIATE RAZORPAY PAYMENT
  // ═══════════════════════════════════════════════════════════════════════════

  static async initiateRazorpayPayment(orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.orderstatus === "cancelled") {
      throw new ApiError(400, "Cannot pay for cancelled order");
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.pricing.total * 100),

      currency: "INR",

      receipt: order._id.toString(),

      notes: {
        orderId: order._id.toString(),
      },
    });

    const payment = await Payment.create({
      orderId: order._id,

      userId: order.userId || null,

      amount: order.pricing.total,

      currency: "INR",

      method: "RAZORPAY",

      status: "pending",

      gatewayOrderId: razorpayOrder.id,

      customerEmail: order.deliveryInfo.email,

      customerPhone: order.deliveryInfo.phone,
    });

    await Order.findByIdAndUpdate(orderId, {
      paymentId: payment._id,
    });

    return {
      razorpayOrderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      paymentId: payment._id,

      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2B — VERIFY RAZORPAY PAYMENT
  // ═══════════════════════════════════════════════════════════════════════════

  static async verifyRazorpayPayment(paymentData) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = paymentData;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !paymentId
    ) {
      throw new ApiError(400, "Incomplete Razorpay payment data");
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await Payment.findByIdAndUpdate(paymentId, {
        status: "failed",
      });

      throw new ApiError(
        400,
        "Payment verification failed — invalid signature",
      );
    }

    const existingPayment = await Payment.findById(paymentId);

    if (existingPayment?.status === "paid") {
      const order = await Order.findById(existingPayment.orderId);

      return {
        order,
        payment: existingPayment,
      };
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,

      {
        status: "paid",

        transactionId: razorpay_payment_id,

        gatewayOrderId: razorpay_order_id,

        gatewayResponse: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },

        paidAt: new Date(),
      },

      {
        new: true,
      },
    );

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    const order = await Order.findByIdAndUpdate(
      payment.orderId,

      {
        orderstatus: "confirmed",

        $push: {
          statusHistory: {
            status: "confirmed",
            note: "Razorpay payment verified",
          },
        },
      },

      {
        new: true,
      },
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Create/link account and send email
    if (order.deliveryInfo?.email) {
      await OrderService._handleUserAccount(order);
    }

    return {
      order,
      payment,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2C — COD CONFIRM
  // ═══════════════════════════════════════════════════════════════════════════

  static async confirmCODOrder(orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.orderstatus === "cancelled") {
      throw new ApiError(400, "Cancelled order cannot be confirmed");
    }

    if (order.paymentId) {
      const existingPayment = await Payment.findById(order.paymentId);

      if (existingPayment) {
        return {
          order,
          payment: existingPayment,
        };
      }
    }

    const payment = await Payment.create({
      orderId: order._id,

      userId: order.userId || null,

      amount: order.pricing.total,

      currency: "INR",

      method: "COD",

      status: "pending",

      customerEmail: order.deliveryInfo.email,

      customerPhone: order.deliveryInfo.phone,
    });

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,

      {
        paymentId: payment._id,

        orderstatus: "confirmed",

        deliverystatus: "pending",

        $push: {
          statusHistory: {
            status: "confirmed",
            note: "COD order confirmed",
          },
        },
      },

      {
        new: true,
      },
    );

    if (!updatedOrder) {
      throw new ApiError(404, "Order not found after confirmation");
    }

    // Create/link account and send email
    if (updatedOrder.deliveryInfo?.email) {
      await OrderService._handleUserAccount(updatedOrder);
    }

    return {
      order: updatedOrder,
      payment,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE ORDER STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  static async updateOrderStatus(
    orderId,
    { orderstatus, deliverystatus, note },
  ) {
    const validOrderStatus = ["pending", "confirmed", "cancelled"];

    const validDeliveryStatus = [
      "pending",
      "assigned",
      "out_for_delivery",
      "delivered",
    ];

    const updates = {};

    if (orderstatus) {
      if (!validOrderStatus.includes(orderstatus)) {
        throw new ApiError(
          400,
          `Invalid orderstatus. Valid: ${validOrderStatus.join(", ")}`,
        );
      }

      updates.orderstatus = orderstatus;
    }

    if (deliverystatus) {
      if (!validDeliveryStatus.includes(deliverystatus)) {
        throw new ApiError(
          400,
          `Invalid deliverystatus. Valid: ${validDeliveryStatus.join(", ")}`,
        );
      }

      updates.deliverystatus = deliverystatus;
    }

    if (!orderstatus && !deliverystatus) {
      throw new ApiError(400, "orderstatus or deliverystatus is required");
    }

    updates.$push = {
      statusHistory: {
        status: orderstatus || deliverystatus,

        note: note || "",
      },
    };

    const order = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET ALL ORDERS
  // ═══════════════════════════════════════════════════════════════════════════

  static async getAllOrders(filters = {}) {
    const { status, deliverystatus, page = 1, limit = 20 } = filters;

    const query = {};

    if (status) {
      query.orderstatus = status;
    }

    if (deliverystatus) {
      query.deliverystatus = deliverystatus;
    }

    const pageNumber = Number(page);

    const limitNumber = Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)

        .populate("paymentId", "status method amount paidAt transactionId")

        .populate("userId", "name email phone")

        .populate("deliveryBoyId", "name phone")

        .sort({
          createdAt: -1,
        })

        .skip((pageNumber - 1) * limitNumber)

        .limit(limitNumber),

      Order.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE ORDER
  // ═══════════════════════════════════════════════════════════════════════════

  static async getOrderById(orderId) {
    const order = await Order.findById(orderId)

      .populate(
        "paymentId",
        "status method amount paidAt transactionId gatewayOrderId",
      )

      .populate("userId", "name email phone")

      .populate("deliveryBoyId", "name phone")

      .populate("items.menuItemId", "name image price");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RAZORPAY WEBHOOK
  // ═══════════════════════════════════════════════════════════════════════════

  static async handleRazorpayWebhook(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      throw new ApiError(500, "Razorpay webhook secret is not configured");
    }

    if (!signature) {
      throw new ApiError(400, "Razorpay webhook signature missing");
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      throw new ApiError(400, "Invalid webhook signature");
    }

    const event = JSON.parse(rawBody);

    // ═══════════════════════════════════════════════════════════════════════════
    // PAYMENT CAPTURED
    // ═══════════════════════════════════════════════════════════════════════════

    if (event.event === "payment.captured") {
      const rp = event.payload?.payment?.entity;

      if (!rp) {
        return {
          received: true,
        };
      }

      const payment = await Payment.findOne({
        gatewayOrderId: rp.order_id,
      });

      if (payment && payment.status !== "paid") {
        payment.status = "paid";

        payment.transactionId = rp.id;

        payment.paidAt = new Date();

        payment.gatewayResponse = rp;

        await payment.save();

        const order = await Order.findByIdAndUpdate(
          payment.orderId,

          {
            orderstatus: "confirmed",

            $push: {
              statusHistory: {
                status: "confirmed",

                note: "Webhook: payment captured",
              },
            },
          },

          {
            new: true,
          },
        );

        if (order?.deliveryInfo?.email) {
          await OrderService._handleUserAccount(order);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PAYMENT FAILED
    // ═══════════════════════════════════════════════════════════════════════════

    if (event.event === "payment.failed") {
      const rp = event.payload?.payment?.entity;

      if (!rp) {
        return {
          received: true,
        };
      }

      const payment = await Payment.findOne({
        gatewayOrderId: rp.order_id,
      });

      if (payment) {
        payment.status = "failed";

        payment.gatewayResponse = rp;

        await payment.save();

        await Order.findByIdAndUpdate(payment.orderId, {
          orderstatus: "cancelled",

          $push: {
            statusHistory: {
              status: "cancelled",

              note: "Webhook: payment failed",
            },
          },
        });
      }
    }

    return {
      received: true,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE / LINK USER + SEND EMAIL
  // ═══════════════════════════════════════════════════════════════════════════

  static async _handleUserAccount(order) {
    const { name, email, phone } = order.deliveryInfo;

    if (!email) {
      console.log("⚠️ No customer email found. Account/email skipped.");

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const loginUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/login`;

    // ═════════════════════════════════════════════════════════════════════════
    // CHECK EXISTING USER
    // ═════════════════════════════════════════════════════════════════════════

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    // ═════════════════════════════════════════════════════════════════════════
    // EXISTING USER
    // ═════════════════════════════════════════════════════════════════════════

    if (existingUser) {
      await User.findByIdAndUpdate(
        existingUser._id,

        {
          $addToSet: {
            orders: order._id,
          },
        },
      );

      await Order.findByIdAndUpdate(
        order._id,

        {
          userId: existingUser._id,

          isGuestOrder: false,
        },
      );

      console.log("👤 Existing user found:", normalizedEmail);

      // Send order confirmation email
      try {
        await sendEmail({
          to: normalizedEmail,

          subject: `🎉 Order Confirmed — ${order.orderId}`,

          html: existingUserOrderEmailTemplate({
            name: existingUser.name || name || "Customer",

            orderId: order.orderId || order._id,

            total: order.pricing?.total,

            paymentMethod: order.paymentMethod,

            loginUrl,
          }),

          text: `
Hello ${existingUser.name || name || "Customer"},

Thank you for ordering from BiteNest.

Your order has been successfully confirmed.

Order ID: ${order.orderId || order._id}
Total Amount: ₹${Number(order.pricing?.total || 0).toFixed(2)}
Payment Method: ${order.paymentMethod || "COD"}

You can view your order and track its status from your BiteNest account.

Login:
${loginUrl}

Thank you for choosing BiteNest.
          `.trim(),
        });

        console.log(
          "✅ Existing user order confirmation email sent:",
          normalizedEmail,
        );
      } catch (emailError) {
        console.error("❌ Existing user order email failed:", emailError);
      }

      return;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // CREATE NEW USER
    // ═════════════════════════════════════════════════════════════════════════

    const tempPassword = generateTempPassword();

    let newUser;

    try {
      newUser = new User({
        name: name?.trim() || "Customer",

        email: normalizedEmail,

        phone: phone?.trim() || "",

        password: tempPassword,

        isActive: true,

        isEmailVerified: true,

        orders: [order._id],
      });

      await newUser.save();

      console.log("✅ New customer account created:", normalizedEmail);
    } catch (err) {
      // Handle duplicate email race condition
      if (err.code === 11000) {
        const raceUser = await User.findOne({
          email: normalizedEmail,
        });

        if (raceUser) {
          await User.findByIdAndUpdate(
            raceUser._id,

            {
              $addToSet: {
                orders: order._id,
              },
            },
          );

          await Order.findByIdAndUpdate(
            order._id,

            {
              userId: raceUser._id,

              isGuestOrder: false,
            },
          );

          console.log(
            "👤 Existing user found after duplicate-email race:",
            normalizedEmail,
          );

          return;
        }
      }

      console.error("❌ User creation failed:", err);

      throw err;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // LINK USER TO ORDER
    // ═════════════════════════════════════════════════════════════════════════

    await Order.findByIdAndUpdate(
      order._id,

      {
        userId: newUser._id,

        isGuestOrder: false,
      },
    );

    // ═════════════════════════════════════════════════════════════════════════
    // SEND NEW ACCOUNT + ORDER CONFIRMATION EMAIL
    // ═════════════════════════════════════════════════════════════════════════

    try {
      await sendEmail({
        to: normalizedEmail,

        subject: `🎉 Order Confirmed & Your BiteNest Account is Ready — ${order.orderId}`,

        html: newUserOrderEmailTemplate({
          name: name || "Customer",

          email: normalizedEmail,

          tempPassword,

          loginUrl,

          orderId: order.orderId || order._id,

          total: order.pricing?.total,

          paymentMethod: order.paymentMethod,
        }),

        text: `
Hello ${name || "Customer"},

Thank you for ordering from BiteNest.

Your order has been successfully confirmed.

Order ID: ${order.orderId || order._id}
Total Amount: ₹${Number(order.pricing?.total || 0).toFixed(2)}
Payment Method: ${order.paymentMethod || "COD"}

We have automatically created a BiteNest account for you.

Login details:

Email: ${normalizedEmail}
Temporary Password: ${tempPassword}

Login here:
${loginUrl}

Please change your password after your first login.

Thank you for choosing BiteNest.
        `.trim(),
      });

      console.log(
        "✅ New user account + order confirmation email sent:",
        normalizedEmail,
      );
    } catch (emailError) {
      // Email failure must NOT cancel the order
      console.error("❌ New user welcome/order email failed:", emailError);
    }
  }
}

export { OrderService };
