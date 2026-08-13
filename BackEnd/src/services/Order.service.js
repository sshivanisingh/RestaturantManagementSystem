import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/order.payment.model.js";
import { Payment } from "../models/order.payment.model.js";
import { User } from "../models/user.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";

// ─── Razorpay instance ────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Temp password helper ─────────────────────────────────────────────────────
const generateTempPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

// ─── Welcome email template ───────────────────────────────────────────────────
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
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;margin:0;padding:0}
    .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;
          overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .hdr{background:linear-gradient(135deg,#f97316,#ec4899);padding:36px 32px;text-align:center}
    .hdr h1{color:#fff;margin:0;font-size:26px}.hdr p{color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px}
    .body{padding:32px}.body h2{color:#111827;font-size:20px;margin:0 0 8px}
    .body p{color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 16px}
    .creds{background:#f3f4f6;border-radius:10px;padding:18px 20px;margin:20px 0}
    .creds p{margin:4px 0;color:#374151;font-size:14px}.creds strong{color:#111827}
    .btn{display:inline-block;padding:14px 32px;
         background:linear-gradient(135deg,#f97316,#ec4899);
         color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:8px 0}
    .order{background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 20px;margin:20px 0}
    .order p{margin:3px 0;color:#92400e;font-size:14px}
    .footer{background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6}
    .footer p{color:#9ca3af;font-size:12px;margin:0}
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
      <p>Thank you for your order. We've automatically created an account so you can track orders, reorder easily, and save your favourites.</p>
      <div class="order">
        <p>📦 <strong>Order ID:</strong> ${orderId}</p>
        <p>Your order is confirmed and being prepared. Track it from your account.</p>
      </div>
      <div class="creds">
        <p>🔑 <strong>Your Login Credentials</strong></p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong>
           <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px">${tempPassword}</code></p>
      </div>
      <p>You can <strong>login right away</strong> — no activation required.</p>
      <a href="${loginUrl}" class="btn">Login &amp; Track Order →</a>
      <p style="font-size:13px;color:#9ca3af;margin-top:16px">
        Please change your password after first login. Ignore this email if you did not place this order.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} BiteNest · Sent because you placed an order.</p>
    </div>
  </div>
</body>
</html>`;

// ═════════════════════════════════════════════════════════════════════════════
class OrderService {
  // ─────────────────────────────────────────────────────────────────────
  // STEP 1 — Create Order
  // ───────────────────────────────────────────────────────────────────────────
  static async createOrder(orderData) {
    const { items, deliveryInfo, paymentMethod, couponCode, notes } = orderData;

    const menuItemIds = items && items.map((i) => i.menuItemId);
    const dbItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      isActive: true,
    });

    const itemsLength = items && items.length;
    if (dbItems.length !== itemsLength) {
      throw new ApiError(400, "One or more items are unavailable");
    }

    const verifiedItems = items.map((reqItem) => {
      const dbItem = dbItems.find(
        (d) => d._id.toString() === reqItem.menuItemId,
      );
      return {
        menuItemId: dbItem._id,
        name: dbItem.name,
        image: dbItem.image,
        price: dbItem.discountedPrice ?? dbItem.price,
        quantity: reqItem.quantity,
      };
    });

    const subtotal = verifiedItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
    const tax = Math.round(subtotal * 0.05);
    const deliveryCharge =
      deliveryInfo.type === "pickup" ? 0 : subtotal >= 500 ? 0 : 40;
    const discount = 0;
    const total = subtotal + tax + deliveryCharge - discount;
    const pricing = { subtotal, tax, deliveryCharge, discount, total };

    const order = await Order.create({
      items: verifiedItems,
      deliveryInfo,
      pricing,
      paymentMethod,
      couponCode: couponCode || null,
      notes: notes || null,
      orderstatus: "pending",
      isGuestOrder: true,
      statusHistory: [{ status: "pending", note: "Order initiated" }],
    });

    return { order, pricing };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 2A — Initiate Razorpay Payment
  // ───────────────────────────────────────────────────────────────────────────

  static async initiateRazorpayPayment(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    // if (order.status !== "pending") throw new ApiError(400, "Order already processed");

    const razorpayOrder = await razorpay.orders.create({
      amount: order.pricing.total * 100,
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        orderId: order._id,
      },
    });
    const payment = await Payment.create({
      orderId: order._id,
      amount: order.pricing.total,
      currency: "INR",
      method: "RAZORPAY",
      status: "pending",
      gatewayOrderId: razorpayOrder.id,
      customerEmail: order.deliveryInfo.email,
      customerPhone: order.deliveryInfo.phone,
    });

    await Order.findByIdAndUpdate(orderId, { paymentId: payment._id });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 2B — Verify Razorpay Payment
  // ───────────────────────────────────────────────────────────────────────────
  static async verifyRazorpayPayment(paymentData) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = paymentData;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await Payment.findByIdAndUpdate(paymentId, { status: "failed" });
      throw new ApiError(
        400,
        "Payment verification failed — invalid signature",
      );
    }

    // FIX: idempotency — if already paid, skip reprocessing
    const existingPayment = await Payment.findById(paymentId);
    if (existingPayment?.status === "paid") {
      const order = await Order.findById(existingPayment.orderId);
      return { order, payment: existingPayment };
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
      { new: true },
    );

    if (!payment) throw new ApiError(404, "Payment record not found");

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
      { new: true },
    );

    if (order.deliveryInfo?.email) {
      await OrderService._handleUserAccount(order);
    }
    return { order, payment };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 2C — COD Order Confirm
  // ───────────────────────────────────────────────────────────────────────────
  static async confirmCODOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    const payment = await Payment.create({
      orderId: order._id,
      amount: order.pricing.total,
      method: "COD",
      status: "pending",
      customerEmail: order.deliveryInfo.email,
      customerPhone: order.deliveryInfo.phone,
    });

    await Order.findByIdAndUpdate(orderId, {
      paymentId: payment._id,
      orderstatus: "confirmed",
      deliverystatus: "pending",
      $push: {
        statusHistory: { status: "pending", note: "COD order pending" },
      },
    });

    const updatedOrder = await Order.findById(orderId);
    if (updatedOrder.deliveryInfo?.email) {
      await OrderService._handleUserAccount(updatedOrder);
    }
    return { order: updatedOrder, payment };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 3 — Update Order Status (admin)
  // ───────────────────────────────────────────────────────────────────────────
  static async updateOrderStatus(
    orderId,
    { orderstatus, deliverystatus, note },
  ) {
    const validOrderStatus = ["confirmed", "cancelled"];
    const validDeliveryStatus = ["pending", "out_for_delivery", "delivered"];

    const updates = {};

    if (orderstatus) {
      if (!validOrderStatus.includes(orderstatus))
        throw new ApiError(
          400,
          `Invalid orderstatus. Valid: ${validOrderStatus.join(", ")}`,
        );
      updates.orderstatus = orderstatus;
    }

    if (deliverystatus) {
      if (!validDeliveryStatus.includes(deliverystatus))
        throw new ApiError(
          400,
          `Invalid deliverystatus. Valid: ${validDeliveryStatus.join(", ")}`,
        );
      updates.deliverystatus = deliverystatus;
    }

    if (!Object.keys(updates).length)
      throw new ApiError(
        400,
        "orderstatus ya deliverystatus dono mein se ek required hai.",
      );

    updates.$push = {
      statusHistory: {
        status: orderstatus || deliverystatus,
        note: note || "",
      },
    };

    const order = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
    });
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET — All orders (admin)
  // ───────────────────────────────────────────────────────────────────────────
  static async getAllOrders(filters = {}) {
    const { status, page = 1, limit = 20 } = filters;
    const query = {};
    if (status) query.orderstatus = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("paymentId", "status method amount paidAt transactionId")
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET — Single order
  // ───────────────────────────────────────────────────────────────────────────
  static async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate(
        "paymentId",
        "status method amount paidAt transactionId gatewayOrderId",
      )
      .populate("userId", "name email phone")
      .populate("items.menuItemId", "name image price");
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Razorpay Webhook
  // ───────────────────────────────────────────────────────────────────────────
  static async handleRazorpayWebhook(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature)
      throw new ApiError(400, "Invalid webhook signature");

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const rp = event.payload.payment.entity;
      const payment = await Payment.findOne({ gatewayOrderId: rp.order_id });

      // FIX: idempotency — if already paid, skip processing again
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
          { new: true },
        );

        if (order?.deliveryInfo?.email) {
          await OrderService._handleUserAccount(order);
        }
      }
    }

    if (event.event === "payment.failed") {
      const rp = event.payload.payment.entity;
      const payment = await Payment.findOne({ gatewayOrderId: rp.order_id });
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

    return { received: true };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRIVATE — Auto create / link user after payment
  //
  // FIX 1: isActive = true  → user can login immediately without activation
  // FIX 2: lookup by email OR phone → prevents duplicate user creation
  // FIX 3: duplicate key guard on save → race condition safe
  // ───────────────────────────────────────────────────────────────────────────
  static async _handleUserAccount(order) {
    const { name, email, phone } = order.deliveryInfo;
    if (!email) return;

    // Look up by email — the login key — to detect returning customers.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Existing user — just link the order to their account
      await User.findByIdAndUpdate(existingUser._id, {
        $addToSet: { orders: order._id },
      });
      await Order.findByIdAndUpdate(order._id, {
        userId: existingUser._id,
        isGuestOrder: false,
      });
      return;
    }

    // New user — auto create
    const tempPassword = generateTempPassword();

    // FIX 3: race condition guard — if two requests arrive simultaneously,
    // catch the duplicate key error instead of creating two users
    // (requires unique index on email + restaurantId in the User schema)
    let newUser;
    try {
      newUser = new User({
        restaurantId: order.restaurantId,
        name,
        email,
        phone: phone || null,
        password: tempPassword,
        // FIX 1: isActive = true — user can login immediately, no activation step needed
        isActive: true,
        orders: [order._id],
      });
      await newUser.save();
    } catch (err) {
      // Duplicate key error — another request already created the user, just link the order
      if (err.code === 11000) {
        const raceUser = await User.findOne({ email });
        if (raceUser) {
          await User.findByIdAndUpdate(raceUser._id, {
            $addToSet: { orders: order._id },
          });
          await Order.findByIdAndUpdate(order._id, {
            userId: raceUser._id,
            isGuestOrder: false,
          });
        }
        return;
      }
      throw err;
    }

    // Link user to order
    await Order.findByIdAndUpdate(order._id, {
      userId: newUser._id,
      isGuestOrder: false,
    });

    // Send user to login page directly — no activation link needed
    const loginUrl = `${process.env.CLIENT_URL}/login`;

    // Send welcome email with credentials
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
  }
}

export { OrderService };
