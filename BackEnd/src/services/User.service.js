import crypto      from "crypto";
import { User }     from "../models/user.model.js";
import { Order }    from "../models/order.payment.model.js";
import { Payment }  from "../models/order.payment.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail} from "../utils/sendEmail.js";
import mongoose from "mongoose";

const cookieOptions = {
  httpOnly: true,
  secure  : process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// ─── Email Templates ──────────────────────────────────────────────────────────

const welcomeEmailTemplate = ({ name, email, tempPassword, activateUrl, orderId }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; margin:0; padding:0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff;
               border-radius: 16px; overflow: hidden;
               box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header  { background: linear-gradient(135deg, #f97316, #ec4899);
               padding: 36px 32px; text-align: center; }
    .header h1 { color:#fff; margin:0; font-size:26px; letter-spacing:-0.5px; }
    .header p  { color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px; }
    .body    { padding: 32px; }
    .body h2 { color:#111827; font-size:20px; margin:0 0 8px; }
    .body p  { color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 16px; }
    .creds   { background:#f3f4f6; border-radius:10px; padding:18px 20px; margin:20px 0; }
    .creds p { margin:4px 0; color:#374151; font-size:14px; }
    .creds strong { color:#111827; }
    .btn     { display:inline-block; padding:14px 32px;
               background: linear-gradient(135deg, #f97316, #ec4899);
               color:#fff; border-radius:8px; text-decoration:none;
               font-weight:600; font-size:15px; margin:8px 0; }
    .order   { background:#fff7ed; border:1px solid #fed7aa;
               border-radius:10px; padding:14px 20px; margin:20px 0; }
    .order p { margin:3px 0; color:#92400e; font-size:14px; }
    .footer  { background:#f9fafb; padding:20px 32px; text-align:center;
               border-top:1px solid #f3f4f6; }
    .footer p { color:#9ca3af; font-size:12px; margin:0; }
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
        Thank you for your order! We've automatically created an account for you
        so you can track your orders, reorder easily, and save your favourites.
      </p>

      <div class="order">
        <p>📦 <strong>Order ID:</strong> ${orderId}</p>
        <p>Your order is being prepared. You can track it from your account.</p>
      </div>

      <div class="creds">
        <p>🔑 <strong>Your Login Credentials</strong></p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
      </div>

      <p>Please set a new password after logging in for the first time.</p>

      <a href="${activateUrl}" class="btn">Activate Account & Set Password</a>

      <p style="font-size:13px;color:#9ca3af;margin-top:16px;">
        This link expires in <strong>24 hours</strong>.
        If you didn't place this order, please ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} BiteNest · You're receiving this because you placed an order.</p>
    </div>
  </div>
</body>
</html>`;

// ─── Helper: generate temp password ──────────────────────────────────────────
const generateTempPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

// ═════════════════════════════════════════════════════════════════════════════
class UserService {

  // ─── Cart: Get ─────────────────────────────────────────────────────────────
  static async getCart(userId) {
    const user = await User.findById(userId)
      .populate({
        path  : "cart.menuItemId",
        select: "name image price discountPercent discountedPrice isAvailable type",
      });
    if (!user) throw new ApiError(404, "User not found");
    return user.cart;
  }

  // ─── Cart: Add / Update quantity ───────────────────────────────────────────
  static async addToCart(userId, menuItemId, quantity = 1) {
    const item = await MenuItem.findById(menuItemId);
    if (!item || !item.isAvailable) throw new ApiError(404, "Item not available");

    const user      = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const existing  = user.cart.find(
      (c) => c.menuItemId.toString() === menuItemId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ menuItemId, quantity });
    }

    await user.save();
    return user.cart;
  }

  // ─── Cart: Update quantity ─────────────────────────────────────────────────
  static async updateCartItem(userId, menuItemId, quantity) {
    if (quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const item = user.cart.find((c) => c.menuItemId.toString() === menuItemId);
    if (!item) throw new ApiError(404, "Item not in cart");

    item.quantity = quantity;
    await user.save();
    return user.cart;
  }

  // ─── Cart: Remove item ─────────────────────────────────────────────────────
  static async removeFromCart(userId, menuItemId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.cart = user.cart.filter(
      (c) => c.menuItemId.toString() !== menuItemId
    );
    await user.save();
    return user.cart;
  }

  // ─── Cart: Clear ───────────────────────────────────────────────────────────
  static async clearCart(userId) {
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });
    return { message: "Cart cleared" };
  }

  // ─── Wishlist: Get ─────────────────────────────────────────────────────────
  static async getWishlist(userId) {
    const user = await User.findById(userId)
      .populate({
        path  : "wishlist",
        select: "name image price discountPercent discountedPrice type categoryId",
      });
    if (!user) throw new ApiError(404, "User not found");
    return user.wishlist;
  }

  // ─── Wishlist: Toggle ──────────────────────────────────────────────────────
static async toggleWishlist(userId, menuItemId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    
    const menuItemObjectId = new mongoose.Types.ObjectId(menuItemId);
    
    // Filter out null values and check if item exists
    const exists = user.wishlist
        .filter(id => id !== null)  
        .some(id => id.toString() === menuItemId);
    
    if (exists) {
       
        user.wishlist = user.wishlist.filter(id => {
            if (id === null) return false;  
            return id.toString() !== menuItemId;
        });
        await user.save();
        return { message: "Removed from wishlist", action: "removed" };
    } else {
       
        user.wishlist.push(menuItemObjectId);
       
        user.wishlist = user.wishlist.filter(id => id !== null);
        await user.save();
        return { message: "Added to wishlist", action: "added" };
    }
}

  // ─── Place Order + Payment + Auto Create Account ───────────────────────────
  static async placeOrder(restaurantId, orderData) {
    const {
      items,          
      deliveryInfo,    
      pricing,          
      paymentMethod,    
      couponCode,
      notes,
    } = orderData;

    // 1. Order create karo
    const order = await Order.create({
      restaurantId,
      items,
      deliveryInfo,
      pricing,
      couponCode,
      notes,
      orderstatus : paymentMethod === "COD" ? "confirmed" : "pending",
      isGuestOrder: true,   // pehle guest, user link baad mein
      statusHistory: [{
        status: paymentMethod === "COD" ? "confirmed" : "pending",
        note  : "Order placed",
      }],
    });

    // 2. Payment record create karo
    const payment = await Payment.create({
      orderId      : order._id,
      restaurantId,
      amount       : pricing.total,
      method       : paymentMethod,
      status       : paymentMethod === "COD" ? "pending" : "pending",
      customerEmail: deliveryInfo.email,
      customerPhone: deliveryInfo.phone,
    });

    // 3. Order mein paymentId link karo
    order.paymentId = payment._id;
    await order.save();

    // 4. Auto User Account create ya link karo — using Order.service consolidation
    // (Note: This method is now consolidated in Order.service to handle race conditions)
    // For now, we manually link the user creation inline to match Order.service approach

    return { order, payment };
  }

  // ─── COD Payment Confirm ───────────────────────────────────────────────────
  static async confirmCODPayment(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");

    payment.status = "paid";
    payment.paidAt = new Date();
    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, {
      orderstatus: "confirmed",
      $push : { statusHistory: { status: "confirmed", note: "COD confirmed" } },
    });

    return payment;
  }

  // ─── Online Payment Verify (Razorpay/Stripe callback) ─────────────────────
  static async verifyOnlinePayment(paymentId, gatewayData) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");

    payment.status          = "paid";
    payment.paidAt          = new Date();
    payment.transactionId   = gatewayData.transactionId;
    payment.gatewayOrderId  = gatewayData.gatewayOrderId;
    payment.gatewayResponse = gatewayData.raw;
    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, {
      orderstatus: "confirmed",
      $push : { statusHistory: { status: "confirmed", note: "Online payment verified" } },
    });

    return payment;
  }


  // ─── Activate Account (set new password) ──────────────────────────────────
  static async activateAccount(rawToken, newPassword) {
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      accountActivateToken : hashed,
      accountActivateExpiry: { $gt: Date.now() },
    });
    if (!user) throw new ApiError(400, "Activation link invalid or expired");

    user.password              = newPassword;
    user.isActive              = true;
    user.isEmailVerified       = true;
    user.accountActivateToken  = undefined;
    user.accountActivateExpiry = undefined;
    await user.save();

    return { message: "Account activated! You can now login." };
  }

  // ─── User Login ───────────────────────────────────────────────────────────
  static async login(email, password, res) {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "No account found with this email");
    if (!user.isActive) throw new ApiError(403, "Please activate your account first. Check your email.");

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) throw new ApiError(401, "Invalid credentials");

    const accessToken  = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("accessToken",  accessToken,  { ...cookieOptions, maxAge: 1  * 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 10 * 24 * 60 * 60 * 1000 });

    const { password: _, refreshToken: __, ...safeData } = user.toObject();
    return { user: safeData, accessToken };
  }

  // ─── User Logout ──────────────────────────────────────────────────────────
  static async logout(userId, res) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    res.clearCookie("accessToken",  cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    return { message: "Logged out successfully" };
  }

  // ─── Get Orders ───────────────────────────────────────────────────────────
  static async getMyOrders(userId) {
    const user = await User.findById(userId).populate({
      path    : "orders",
      populate: { path: "paymentId", select: "status method amount paidAt" },
      options : { sort: { createdAt: -1 } },
    });
    if (!user) throw new ApiError(404, "User not found");
    return user.orders;
  }

  // ─── Get Profile ──────────────────────────────────────────────────────────
static async getProfile(userId) {
    // Ensure MenuItem model is accessible
    const MenuItem = mongoose.model('MenuItem');
    
    const user = await User.findById(userId)
      .select("-password -refreshToken -resetPasswordToken -accountActivateToken")
      .populate({
        path: 'cart.menuItemId',  // ← Fixed: populate the menuItemId field inside cart objects
        model: MenuItem,
        select: 'name price description image category isAvailable'
      })
      .populate({
        path: 'wishlist',  // This one is correct since wishlist is array of ObjectIds
        model: MenuItem,
        select: 'name price description image category isAvailable'
      });
      
    if (!user) throw new ApiError(404, "User not found");
    
    // Filter out null items (optional)
    if (user.cart) {
      user.cart = user.cart.filter(item => item.menuItemId !== null);
    }
    if (user.wishlist) {
      user.wishlist = user.wishlist.filter(item => item !== null);
    }
    
    return user;
}

  // ─── Update Profile ───────────────────────────────────────────────────────
  static async updateProfile(userId, data) {
    const { name, phone, addresses } = data;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name, phone, ...(addresses && { addresses }) } },
      { new: true }
    ).select("-password -refreshToken");
    return user;
  }

  // ─── Change Password ──────────────────────────────────────────────────────
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) throw new ApiError(400, "Current password is incorrect");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return { message: "Password changed successfully" };
  }
}

export { UserService, cookieOptions };