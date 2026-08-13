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
// TEMP PASSWORD
// ═════════════════════════════════════════════════════════════════════════════

const generateTempPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";

  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

// ═════════════════════════════════════════════════════════════════════════════
// WELCOME EMAIL
// ═════════════════════════════════════════════════════════════════════════════

const welcomeEmailTemplate = ({
  name,
  email,
  tempPassword,
  loginUrl,
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

    .wrap {
      max-width: 560px;
      margin: 40px auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,.08);
    }

    .hdr {
      background: linear-gradient(135deg,#f97316,#ec4899);
      padding: 36px 32px;
      text-align: center;
    }

    .hdr h1 {
      color: #fff;
      margin: 0;
      font-size: 26px;
    }

    .hdr p {
      color: rgba(255,255,255,.85);
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
      background: linear-gradient(135deg,#f97316,#ec4899);
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
  <div class="wrap">

    <div class="hdr">
      <h1>🎉 Order Confirmed!</h1>
      <p>Your account is ready — you can login right now</p>
    </div>

    <div class="body">

      <h2>Hi ${name}! 👋</h2>

      <p>
        Thank you for your order. We've automatically created
        an account so you can track orders, reorder easily,
        and save your favourites.
      </p>

      <div class="order">
        <p>
          📦 <strong>Order ID:</strong> ${orderId}
        </p>

        <p>
          Your order is confirmed and being prepared.
          Track it from your account.
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
          <strong>Password:</strong>
          <code style="
            background:#e5e7eb;
            padding:2px 6px;
            border-radius:4px
          ">
            ${tempPassword}
          </code>
        </p>

      </div>

      <p>
        You can <strong>login right away</strong> —
        no activation required.
      </p>

      <a href="${loginUrl}" class="btn">
        Login &amp; Track Order →
      </a>

      <p style="
        font-size:13px;
        color:#9ca3af;
        margin-top:16px
      ">
        Please change your password after first login.
        Ignore this email if you did not place this order.
      </p>

    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()}
        BiteNest · Sent because you placed an order.
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

    // ─────────────────────────────────────────────────────────────────────
    // Validate cart
    // ─────────────────────────────────────────────────────────────────────

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    // ─────────────────────────────────────────────────────────────────────
    // Validate delivery information
    // ─────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────
    // Get menu item IDs
    //
    // Supports:
    // item.menuItemId
    // item.id
    // item._id
    // ─────────────────────────────────────────────────────────────────────

    const menuItemIds = items.map((item) => {
      const id = item.menuItemId || item.id || item._id;

      if (!id) {
        throw new ApiError(400, "Cart item is missing menu item ID");
      }

      return id.toString();
    });

    // ─────────────────────────────────────────────────────────────────────
    // Fetch active menu items
    // ─────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────
    // Verify every item
    // ─────────────────────────────────────────────────────────────────────

    const verifiedItems = items.map((reqItem) => {
      const requestedId = (
        reqItem.menuItemId ||
        reqItem.id ||
        reqItem._id
      )?.toString();

      const dbItem = dbItems.find(
        (item) => item._id.toString() === requestedId,
      );

      // IMPORTANT FIX
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

    // ─────────────────────────────────────────────────────────────────────
    // Pricing
    // ─────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────
    // Create order
    // ─────────────────────────────────────────────────────────────────────

    const order = await Order.create({
      items: verifiedItems,

      deliveryInfo: {
        name: deliveryInfo.name.trim(),

        phone: deliveryInfo.phone.trim(),

        email: deliveryInfo.email?.trim() || null,

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

    // ─────────────────────────────────────────────────────────────────────
    // Idempotency
    // ─────────────────────────────────────────────────────────────────────

    const existingPayment = await Payment.findById(paymentId);

    if (existingPayment?.status === "paid") {
      const order = await Order.findById(existingPayment.orderId);

      return {
        order,
        payment: existingPayment,
      };
    }

    // ─────────────────────────────────────────────────────────────────────
    // Update payment
    // ─────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────
    // Confirm order
    // ─────────────────────────────────────────────────────────────────────

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

    // Prevent duplicate payment
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

    // ─────────────────────────────────────────────────────────────────────
    // Payment captured
    // ─────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────
    // Payment failed
    // ─────────────────────────────────────────────────────────────────────

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
  // AUTO CREATE / LINK USER
  // ═══════════════════════════════════════════════════════════════════════════

  static async _handleUserAccount(order) {
    const { name, email, phone } = order.deliveryInfo;

    if (!email) {
      return;
    }

    const existingUser = await User.findOne({
      email,
    });

    // ─────────────────────────────────────────────────────────────────────
    // Existing user
    // ─────────────────────────────────────────────────────────────────────

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

      return;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Create new user
    // ─────────────────────────────────────────────────────────────────────

    const tempPassword = generateTempPassword();

    let newUser;

    try {
      newUser = new User({
        restaurantId: order.restaurantId || null,

        name,

        email,

        phone: phone || null,

        password: tempPassword,

        isActive: true,

        orders: [order._id],
      });

      await newUser.save();
    } catch (err) {
      // Duplicate email
      if (err.code === 11000) {
        const raceUser = await User.findOne({
          email,
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
        }

        return;
      }

      throw err;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Link user to order
    // ─────────────────────────────────────────────────────────────────────

    await Order.findByIdAndUpdate(
      order._id,

      {
        userId: newUser._id,

        isGuestOrder: false,
      },
    );

    // ─────────────────────────────────────────────────────────────────────
    // Send email
    // ─────────────────────────────────────────────────────────────────────

    const loginUrl = `${process.env.CLIENT_URL}/login`;

    try {
      await sendEmail({
        to: email,

        subject: `🎉 Order Confirmed & Your Account is Ready — ${order.orderId}`,

        html: welcomeEmailTemplate({
          name,
          email,
          tempPassword,
          loginUrl,
          orderId: order.orderId,
        }),

        text: `Hi ${name}, Order ${order.orderId} confirmed. Login: ${email} / ${tempPassword}. Login here: ${loginUrl}`,
      });
    } catch (emailError) {
      // Do NOT fail the order if email fails
      console.error("Welcome email failed:", emailError);
    }
  }
}

export { OrderService };
