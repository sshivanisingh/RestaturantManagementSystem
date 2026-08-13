import mongoose, { Schema } from "mongoose";
import bcrypt               from "bcrypt";
import jwt                  from "jsonwebtoken";
import crypto               from "crypto";

const addressSchema = new Schema({
  label    : { type: String, default: "Home" },   
  street   : { type: String, required: true },
  city     : { type: String, required: true },
  state    : { type: String },
  pincode  : { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const cartItemSchema = new Schema({
  menuItemId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : "MenuItem",                         
    required: true,
  },
  quantity: { type: Number, default: 1, min: 1 },
}, { _id: false });

const userSchema = new Schema({
  // restaurantId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref : "Restaurant",
  //   required: true,
  // },

  name    : { type: String, required: true, trim: true },
  email   : { type: String, required: true, lowercase: true, trim: true },
  phone   : { type: String, required: true },
  password: { type: String },                     

  isActive       : { type: Boolean, default: false },  
  isEmailVerified: { type: Boolean, default: false },

 
  cart: [cartItemSchema],

  // ✅ Wishlist — array of MenuItem ObjectIds
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref : "MenuItem",
  }],

  role:{
    type: String,
    enum: ["customer"],
    default: "customer",
  },

  addresses: [addressSchema],

  // ✅ Orders history ref
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref : "Order",
  }],

  refreshToken          : { type: String },
  resetPasswordToken    : { type: String },
  resetPasswordExpiry   : { type: Date   },
  accountActivateToken  : { type: String },   
  accountActivateExpiry : { type: Date   },

}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
// Phone is NOT unique: accounts are keyed on email (the login field), and the
// same phone number can legitimately be reused across different customer emails
// (e.g. guest checkouts auto-creating an account per email).
userSchema.index({ phone: 1 });

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Methods ───────────────────────────────────────────────────────────────────
userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: "customer" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
  );
};

// Account activate token (payment ke baad bheja jaayega)
userSchema.methods.generateActivateToken = function () {
  const raw     = crypto.randomBytes(32).toString("hex");
  const hashed  = crypto.createHash("sha256").update(raw).digest("hex");
  this.accountActivateToken  = hashed;
  this.accountActivateExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs
  return raw;
};

userSchema.methods.generateResetToken = function () {
  const raw     = crypto.randomBytes(32).toString("hex");
  const hashed  = crypto.createHash("sha256").update(raw).digest("hex");
  this.resetPasswordToken  = hashed;
  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min
  return raw;
};

export const User = mongoose.model("User", userSchema);