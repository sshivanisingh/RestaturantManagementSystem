import { DeliveryBoy } from "../models/deliveryboy.model.js";
import { Order } from "../models/order.payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const deliveryBoyWelcomeEmail = ({ name, email, password }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;margin:0;padding:0}
    .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;
          overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .hdr{background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:36px 32px;text-align:center}
    .hdr h1{color:#fff;margin:0;font-size:26px}
    .hdr p{color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px}
    .body{padding:32px}
    .body h2{color:#111827;font-size:20px;margin:0 0 8px}
    .body p{color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 16px}
    .creds{background:#f3f4f6;border-radius:10px;padding:18px 20px;margin:20px 0}
    .creds p{margin:4px 0;color:#374151;font-size:14px}
    .creds strong{color:#111827}
    .btn{display:inline-block;padding:14px 32px;
         background:linear-gradient(135deg,#1d4ed8,#7c3aed);
         color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:8px 0}
    .footer{background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6}
    .footer p{color:#9ca3af;font-size:12px;margin:0}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>🛵 Welcome, Delivery Partner!</h1>
      <p>Your account has been created successfully</p>
    </div>
    <div class="body">
      <h2>Hi ${name}! 👋</h2>
      <p>You've been registered as a delivery partner. Once admin approves your account, you can start accepting orders.</p>
      <div class="creds">
        <p>🔑 <strong>Your Login Credentials</strong></p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong>
           <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px">${password}</code></p>
      </div>
      <p style="font-size:13px;color:#9ca3af;margin-top:16px">
        Please change your password after first login.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} BiteNest · Delivery Partner Portal</p>
    </div>
  </div>
</body>
</html>`;

// ─── Helper: generate tokens ──────────────────────────────────────────────────
const generateTokens = async (deliveryBoy) => {
  const accessToken = deliveryBoy.generateAccessToken();
  const refreshToken = deliveryBoy.generateRefreshToken();
  deliveryBoy.refreshToken = refreshToken;
  await deliveryBoy.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

// ═════════════════════════════════════════════════════════════════════════════
class DeliveryBoyService {
  // ───────────────────────────────────────────────────────────────────────────
  // REGISTER — Admin creates delivery boy account
  // ───────────────────────────────────────────────────────────────────────────
  static async register(data) {
    const { name, email, phone, password, vehicleType, vehicleNumber } = data;

    if (!name || !email || !phone || !password) {
      throw new ApiError(400, "Name, email, phone aur password required hain");
    }

    const existing = await DeliveryBoy.findOne({ email: email.toLowerCase() });
    if (existing)
      throw new ApiError(
        409,
        "Is email se pehle se delivery boy registered hai",
      );

    const deliveryBoy = await DeliveryBoy.create({
      name,
      email: email.toLowerCase(),
      phone,
      password, // pre-save hook hash karega
      vehicleType: vehicleType || "bike",
      vehicleNumber: vehicleNumber || null,
      isApproved: false, // admin baad mein approve karega
      isActive: true,
    });

    // Welcome email
    try {
      await sendEmail({
        to: email,
        subject: "🛵 Welcome — Delivery Partner Account Created",
        html: deliveryBoyWelcomeEmail({ name, email, password }),
        text: `Hi ${name}, your delivery partner account is created. Email: ${email}, Password: ${password}`,
      });
    } catch (_) {
      /* email fail ho toh registration block na ho */
    }

    return {
      _id: deliveryBoy._id,
      name: deliveryBoy.name,
      email: deliveryBoy.email,
      phone: deliveryBoy.phone,
      isApproved: deliveryBoy.isApproved,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ───────────────────────────────────────────────────────────────────────────
  static async login(email, password) {
    const deliveryBoy = await DeliveryBoy.findOne({
      email: email.toLowerCase(),
    });

    if (!deliveryBoy) throw new ApiError(401, "Email ya password galat hai");
    if (!deliveryBoy.isActive)
      throw new ApiError(403, "Account deactivate hai. Admin se contact karo");
    if (!deliveryBoy.isApproved)
      throw new ApiError(
        403,
        "Account abhi approve nahi hua. Admin se contact karo",
      );

    const isMatch = await deliveryBoy.isPasswordCorrect(password);
    if (!isMatch) throw new ApiError(401, "Email ya password galat hai");

    const { accessToken, refreshToken } = await generateTokens(deliveryBoy);

    return {
      deliveryBoy: {
        _id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        vehicleType: deliveryBoy.vehicleType,
        isOnline: deliveryBoy.isOnline,
        currentOrderId: deliveryBoy.currentOrderId,
      },
      accessToken,
      refreshToken,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LOGOUT
  // ───────────────────────────────────────────────────────────────────────────
  static async logout(deliveryBoyId) {
    await DeliveryBoy.findByIdAndUpdate(deliveryBoyId, {
      refreshToken: null,
      isOnline: false,
    });
    return { message: "Logged out successfully" };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // REFRESH TOKEN
  // ───────────────────────────────────────────────────────────────────────────
  static async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken)
      throw new ApiError(401, "Refresh token required");

    let decoded;
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const deliveryBoy = await DeliveryBoy.findById(decoded._id);
    if (!deliveryBoy || deliveryBoy.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token invalid ya expire ho gaya");
    }

    const { accessToken, refreshToken } = await generateTokens(deliveryBoy);
    return { accessToken, refreshToken };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TOGGLE ONLINE STATUS — delivery boy khud online/offline karta hai
  // ───────────────────────────────────────────────────────────────────────────
  static async toggleOnlineStatus(deliveryBoyId, isOnline) {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      { isOnline },
      { new: true },
    ).select("-password -refreshToken");

    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    return deliveryBoy;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE LOCATION — delivery boy apni live location update karta hai
  //   body: { latitude, longitude }
  // ───────────────────────────────────────────────────────────────────────────
  static async updateLocation(deliveryBoyId, { latitude, longitude }) {
    if (latitude == null || longitude == null) {
      throw new ApiError(400, "latitude aur longitude required hain");
    }

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      {
        currentLocation: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        lastLocationUpdatedAt: new Date(),
      },
      { new: true },
    ).select(
      "name currentLocation lastLocationUpdatedAt currentOrderId isOnline",
    );

    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    return deliveryBoy;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET AVAILABLE ORDERS — delivery boy ko pending/confirmed orders dikhao
  //   jo unke restaurant ke hain aur abhi kisi ko assign nahi hain
  // ───────────────────────────────────────────────────────────────────────────
  static async getAvailableOrders(deliveryBoyId) {
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    if (!deliveryBoy.isOnline) throw new ApiError(400, "Pehle online ho jao");

    // Agar pehle se koi order chal raha hai
    if (deliveryBoy.currentOrderId) {
      throw new ApiError(
        400,
        "Aap pehle se ek order deliver kar rahe ho. Pehle use complete karo.",
      );
    }

    const orders = await Order.find({
      orderstatus: "confirmed",
      deliverystatus: "pending",
      deliveryBoyId: null,
      "deliveryInfo.type": "delivery",
    })
      .populate("userId", "name phone email")
      .sort({ createdAt: 1 }) // purana order pehle
      .select("orderId items deliveryInfo pricing createdAt customerLocation");

    return orders;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ACCEPT ORDER — delivery boy order accept karta hai
  // ───────────────────────────────────────────────────────────────────────────
  static async acceptOrder(deliveryBoyId, orderId) {
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    if (!deliveryBoy.isOnline) throw new ApiError(400, "Pehle online ho jao");
    if (!deliveryBoy.isActive) throw new ApiError(403, "Account inactive hai");

    if (deliveryBoy.currentOrderId) {
      throw new ApiError(
        400,
        "Pehle current order complete karo, tab naya accept karo",
      );
    }

    // Order lock karo — atomic update with condition
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        orderstatus: "confirmed",
        deliverystatus: "pending",
        deliveryBoyId: null, // race condition: sirf tab assign karo jab null ho
      },
      {
        deliveryBoyId: deliveryBoyId,
        deliveryBoyAssignedAt: new Date(),
        deliverystatus: "assigned",
        $push: {
          statusHistory: {
            status: "assigned",
            note: `Delivery boy ${deliveryBoy.name} ne order accept kiya`,
          },
        },
      },
      { new: true },
    ).populate("userId", "name phone email");

    if (!order) {
      throw new ApiError(
        409,
        "Yeh order already kisi aur ne le liya ya available nahi hai",
      );
    }

    // Delivery boy ke currentOrderId update karo
    await DeliveryBoy.findByIdAndUpdate(deliveryBoyId, {
      currentOrderId: order._id,
    });

    return order;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE DELIVERY STATUS — out_for_delivery → delivered
  //   deliveryBoy sirf apna current order update kar sakta hai
  // ───────────────────────────────────────────────────────────────────────────
  static async updateDeliveryStatus(
    deliveryBoyId,
    orderId,
    { deliverystatus, note },
  ) {
    const validStatuses = ["out_for_delivery", "delivered"];
    if (!validStatuses.includes(deliverystatus)) {
      throw new ApiError(400, `Valid statuses: ${validStatuses.join(", ")}`);
    }

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");

    // Verify yahi delivery boy is order ka hai
    const order = await Order.findOne({
      _id: orderId,
      deliveryBoyId: deliveryBoyId,
    });
    if (!order) throw new ApiError(403, "Yeh order aapka nahi hai");

    // Status transition validation
    if (
      deliverystatus === "out_for_delivery" &&
      order.deliverystatus !== "assigned"
    ) {
      throw new ApiError(400, "Order pehle assigned hona chahiye");
    }
    if (
      deliverystatus === "delivered" &&
      order.deliverystatus !== "out_for_delivery"
    ) {
      throw new ApiError(400, "Order pehle out_for_delivery hona chahiye");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        deliverystatus,
        $push: {
          statusHistory: {
            status: deliverystatus,
            note: note || `Status updated to ${deliverystatus}`,
          },
        },
      },
      { new: true },
    );

    // Agar delivered ho gaya — delivery boy free karo aur stats update karo
    if (deliverystatus === "delivered") {
      await DeliveryBoy.findByIdAndUpdate(deliveryBoyId, {
        currentOrderId: null,
        $inc: {
          totalDeliveries: 1,
          totalEarnings: order.pricing.deliveryCharge ?? 30,
        },
      });
    }

    return updatedOrder;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET MY CURRENT ORDER — delivery boy ka active order aur customer location
  // ───────────────────────────────────────────────────────────────────────────
  static async getCurrentOrder(deliveryBoyId) {
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");

    if (!deliveryBoy.currentOrderId) {
      return { order: null, message: "Koi active order nahi hai" };
    }

    const order = await Order.findById(deliveryBoy.currentOrderId)
      .populate("userId", "name phone email")
      .populate("paymentId", "status method amount")
      .select(
        "orderId items deliveryInfo pricing orderstatus deliverystatus customerLocation statusHistory createdAt deliveryBoyAssignedAt",
      );

    return { order };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET DELIVERY BOY LOCATION — customer apne delivery boy ki location dekhta hai
  //   Customer sirf apne order ka delivery boy track kar sakta hai
  // ───────────────────────────────────────────────────────────────────────────
  static async getDeliveryBoyLocation(orderId, requestingUserId) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    // Verify requesting user is the order owner
    if (
      requestingUserId &&
      order.userId?.toString() !== requestingUserId.toString()
    ) {
      throw new ApiError(403, "Aap sirf apna order track kar sakte ho");
    }

    if (!order.deliveryBoyId) {
      return { message: "Delivery boy abhi assign nahi hua", location: null };
    }

    if (!["assigned", "out_for_delivery"].includes(order.deliverystatus)) {
      return {
        message: `Order ka status: ${order.deliverystatus}`,
        location: null,
      };
    }

    const deliveryBoy = await DeliveryBoy.findById(order.deliveryBoyId).select(
      "name phone currentLocation lastLocationUpdatedAt vehicleType",
    );

    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");

    return {
      deliveryBoy: {
        name: deliveryBoy.name,
        phone: deliveryBoy.phone,
        vehicleType: deliveryBoy.vehicleType,
        currentLocation: deliveryBoy.currentLocation,
        lastLocationUpdatedAt: deliveryBoy.lastLocationUpdatedAt,
      },
      orderStatus: order.deliverystatus,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET MY ORDER HISTORY — delivery boy ki past deliveries
  // ───────────────────────────────────────────────────────────────────────────
  static async getMyOrderHistory(deliveryBoyId, { page = 1, limit = 20 } = {}) {
    const [orders, total] = await Promise.all([
      Order.find({ deliveryBoyId, deliverystatus: "delivered" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select(
          "orderId items.name items.quantity pricing deliveryInfo.address deliveryInfo.city createdAt deliveryRating",
        ),
      Order.countDocuments({ deliveryBoyId, deliverystatus: "delivered" }),
    ]);

    return {
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RATE DELIVERY BOY — customer delivery ke baad rating deta hai
  // ───────────────────────────────────────────────────────────────────────────
  static async rateDelivery(orderId, userId, { rating, comment }) {
    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating 1 se 5 ke beech honi chahiye");
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.deliverystatus !== "delivered") {
      throw new ApiError(400, "Sirf delivered orders ko rate kar sakte ho");
    }
    if (order.deliveryRating?.rating) {
      throw new ApiError(400, "Is order ko aap pehle se rate kar chuke ho");
    }

    // Save rating on order
    await Order.findByIdAndUpdate(orderId, {
      deliveryRating: { rating, comment: comment || null, ratedAt: new Date() },
    });

    // Update delivery boy average rating
    const deliveryBoy = await DeliveryBoy.findById(order.deliveryBoyId);
    if (deliveryBoy) {
      const newTotal = deliveryBoy.totalRatings + 1;
      const newAvg =
        (deliveryBoy.averageRating * deliveryBoy.totalRatings + rating) /
        newTotal;
      await DeliveryBoy.findByIdAndUpdate(order.deliveryBoyId, {
        averageRating: Math.round(newAvg * 10) / 10,
        totalRatings: newTotal,
      });
    }

    return { message: "Rating submit ho gayi, shukriya!" };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ADMIN — Approve / Deactivate delivery boy
  // ───────────────────────────────────────────────────────────────────────────
  static async approveDeliveryBoy(deliveryBoyId, { isApproved, isActive }) {
    const updates = {};
    if (isApproved !== undefined) updates.isApproved = isApproved;
    if (isActive !== undefined) updates.isActive = isActive;

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      updates,
      { new: true },
    ).select("-password -refreshToken");

    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    return deliveryBoy;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ADMIN — Get all delivery boys of a restaurant
  // ───────────────────────────────────────────────────────────────────────────
  static async getAllDeliveryBoys({ page = 1, limit = 20, isOnline } = {}) {
    const query = {};
    if (isOnline !== undefined) query.isOnline = isOnline === "true";

    const [deliveryBoys, total] = await Promise.all([
      DeliveryBoy.find(query)
        .select("-password -refreshToken -otp -otpExpiry")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      DeliveryBoy.countDocuments(query),
    ]);

    return {
      deliveryBoys,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ADMIN — Manually assign delivery boy to an order
  // ───────────────────────────────────────────────────────────────────────────
  static async assignDeliveryBoy(orderId, deliveryBoyId) {
    const [order, deliveryBoy] = await Promise.all([
      Order.findById(orderId),
      DeliveryBoy.findById(deliveryBoyId),
    ]);

    if (!order) throw new ApiError(404, "Order not found");
    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    if (!deliveryBoy.isActive || !deliveryBoy.isApproved) {
      throw new ApiError(400, "Delivery boy inactive ya unapproved hai");
    }
    if (deliveryBoy.currentOrderId) {
      throw new ApiError(400, "Delivery boy abhi kisi aur order par hai");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        deliveryBoyId: deliveryBoyId,
        deliveryBoyAssignedAt: new Date(),
        deliverystatus: "assigned",
        $push: {
          statusHistory: {
            status: "assigned",
            note: `Admin ne ${deliveryBoy.name} ko assign kiya`,
          },
        },
      },
      { new: true },
    );

    await DeliveryBoy.findByIdAndUpdate(deliveryBoyId, {
      currentOrderId: orderId,
    });

    return updatedOrder;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET PROFILE — delivery boy apna profile dekhta hai
  // ───────────────────────────────────────────────────────────────────────────
  static async getProfile(deliveryBoyId) {
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId)
      .select("-password -refreshToken -otp -otpExpiry")
      .populate(
        "currentOrderId",
        "orderId deliverystatus deliveryInfo.address",
      );

    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    return deliveryBoy;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE PROFILE
  // ───────────────────────────────────────────────────────────────────────────
  static async updateProfile(
    deliveryBoyId,
    { name, phone, vehicleType, vehicleNumber },
  ) {
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (vehicleType) updates.vehicleType = vehicleType;
    if (vehicleNumber) updates.vehicleNumber = vehicleNumber;

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      updates,
      { new: true },
    ).select("-password -refreshToken");

    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");
    return deliveryBoy;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CHANGE PASSWORD
  // ───────────────────────────────────────────────────────────────────────────
  static async changePassword(deliveryBoyId, { oldPassword, newPassword }) {
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");

    const isMatch = await deliveryBoy.isPasswordCorrect(oldPassword);
    if (!isMatch) throw new ApiError(401, "Purana password galat hai");

    deliveryBoy.password = newPassword;
    await deliveryBoy.save();

    return { message: "Password successfully change ho gaya" };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET MY EARNINGS — delivery boy ka earnings breakdown
  // ───────────────────────────────────────────────────────────────────────────
  static async getMyEarnings(deliveryBoyId) {
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) throw new ApiError(404, "Delivery boy not found");

    const orders = await Order.find({
      deliveryBoyId,
      deliverystatus: "delivered",
    }).select("pricing deliveryCharge createdAt");

    const earnings = orders.reduce((total, order) => {
      return total + (order.pricing?.deliveryCharge ?? 30);
    }, 0);

    return {
      totalEarnings: deliveryBoy.totalEarnings,
      totalDeliveries: deliveryBoy.totalDeliveries,
      averagePerDelivery:
        deliveryBoy.totalDeliveries > 0
          ? (deliveryBoy.totalEarnings / deliveryBoy.totalDeliveries).toFixed(2)
          : 0,
      averageRating: deliveryBoy.averageRating,
      totalRatings: deliveryBoy.totalRatings,
    };
  }
}

export { DeliveryBoyService };
