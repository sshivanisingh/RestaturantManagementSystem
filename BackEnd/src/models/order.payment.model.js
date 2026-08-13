// import mongoose, { Schema } from "mongoose";

// // ═════════════════════════════════════════════════════════════════════════════
// //  ORDER MODEL
// // ═════════════════════════════════════════════════════════════════════════════
// const orderItemSchema = new Schema({
//   menuItemId: {
//     type    : mongoose.Schema.Types.ObjectId,
//     ref     : "MenuItem",                     
//     required: true,
//   },
//   // Snapshot — price baad mein change ho toh bhi order sahi rahe
//   name    : { type: String,  required: true },
//   image   : { type: String },
//   price   : { type: Number,  required: true },
//   quantity: { type: Number,  required: true, min: 1 },
// }, { _id: false });

// const orderSchema = new Schema({
//   orderId     : { type: String, unique: true },  
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
//   paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
//   items: [orderItemSchema],
//   deliveryInfo: {
//     name   : { type: String, required: true },
//     phone  : { type: String, required: true },
//     email  : { type: String },
//     address : { type: String, required: true },
//     city   : { type: String, required: true },
//     state  : { type: String },
//     pincode: { type: String, required: true },
//     type   : { type: String, enum: ["delivery", "pickup"], default: "delivery" },
//   },
//   pricing: {
//     subtotal      : { type: Number, required: true },
//     tax           : { type: Number, default: 0 },
//     deliveryCharge: { type: Number, default: 0 },
//     discount      : { type: Number, default: 0 },
//     total         : { type: Number, required: true },
//   },

//   couponCode: { type: String, default: null },

//   orderstatus: {
//     type   : String,
//     enum   : ["pending", "confirmed","cancelled"],
//     default: "pending",
//   },

//    deliverystatus:{
//     type   : String,
//     enum   : ["pending", "out_for_delivery", "delivered"],
//     default: "pending",
//   },


//   statusHistory: [{
//     status   : String,
//     timestamp: { type: Date, default: Date.now },
//     note     : String,
//   }],

//   notes          : { type: String },              // user ka special instruction
//   estimatedTime  : { type: Number },              // minutes
//   isGuestOrder   : { type: Boolean, default: false },

// }, { timestamps: true });

// // Auto generate orderId before save
// orderSchema.pre("save", async function (next) {
//   if (!this.orderId) {
//     const count     = await mongoose.model("Order").countDocuments();
//     const year      = new Date().getFullYear();
//     this.orderId    = `ORD-${year}-${String(count + 1).padStart(4, "0")}`;
//   }
// });

// export const Order = mongoose.model("Order", orderSchema);


// // ═════════════════════════════════════════════════════════════════════════════
// //  PAYMENT MODEL
// // ═════════════════════════════════════════════════════════════════════════════
// const paymentSchema = new Schema({
//   orderId: {
//     type    : mongoose.Schema.Types.ObjectId,
//     ref     : "Order",
//     required: true,
//   },
//   userId: {
//     type   : mongoose.Schema.Types.ObjectId,
//     ref    : "User",
//     default: null,
//   },
 

//   amount  : { type: Number, required: true },
//   currency: { type: String, default: "INR" },

//   method: {
//     type: String,
//     enum: ["COD", "UPI", "CARD", "NETBANKING", "WALLET","RAZORPAY"],
//     required: true,
//   },

//   status: {
//     type   : String,
//     enum   : ["pending", "paid", "failed", "refunded", "partially_refunded"],
//     default: "pending",
//   },

//   // Razorpay / Stripe response
//   transactionId    : { type: String, default: null },
//   gatewayOrderId   : { type: String, default: null },  // Razorpay order_id
//   gatewayResponse  : { type: Schema.Types.Mixed },     // raw gateway response

//   paidAt    : { type: Date },
//   refundedAt: { type: Date },
//   refundAmount: { type: Number, default: 0 },

//   // Delivery info snapshot
//   customerEmail: { type: String },
//   customerPhone: { type: String },

// }, { timestamps: true });

// export const Payment = mongoose.model("Payment", paymentSchema);













import mongoose, { Schema } from "mongoose";

// ═════════════════════════════════════════════════════════════════════════════
//  ORDER MODEL
// ═════════════════════════════════════════════════════════════════════════════
const orderItemSchema = new Schema(
  {
    menuItemId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "MenuItem",
      required: true,
    },
    // Snapshot — price baad mein change ho toh bhi order sahi rahe
    name    : { type: String, required: true },
    image   : { type: String },
    price   : { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderId     : { type: String, unique: true },
    userId      : { type: mongoose.Schema.Types.ObjectId, ref: "User",        default: null },
    paymentId   : { type: mongoose.Schema.Types.ObjectId, ref: "Payment",     default: null },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant",  default: null },

    // ── Delivery Boy Assignment ────────────────────────────────────────────
    deliveryBoyId: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : "DeliveryBoy",
      default: null,
    },
    deliveryBoyAssignedAt: { type: Date, default: null },

    items: [orderItemSchema],

    deliveryInfo: {
      name   : { type: String, required: true },
      phone  : { type: String, required: true },
      email  : { type: String },
      address: { type: String, required: true },
      city   : { type: String, required: true },
      state  : { type: String },
      pincode: { type: String, required: true },
      type   : { type: String, enum: ["delivery", "pickup"], default: "delivery" },
    },

    // ── Customer's live location (optional — set at order time) ────────────
    customerLocation: {
      type       : { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: null }, // [lng, lat]
    },

    pricing: {
      subtotal      : { type: Number, required: true },
      tax           : { type: Number, default: 0 },
      deliveryCharge: { type: Number, default: 0 },
      discount      : { type: Number, default: 0 },
      total         : { type: Number, required: true },
    },

    couponCode: { type: String, default: null },

    orderstatus: {
      type   : String,
      enum   : ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    deliverystatus: {
      type   : String,
      enum   : ["pending", "assigned", "out_for_delivery", "delivered"],
      default: "pending",
    },

    statusHistory: [
      {
        status   : String,
        timestamp: { type: Date, default: Date.now },
        note     : String,
      },
    ],

    notes        : { type: String },
    estimatedTime: { type: Number },  // minutes
    isGuestOrder : { type: Boolean, default: false },

    // Delivery boy rating by customer after delivery
    deliveryRating: {
      rating : { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: null },
      ratedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Auto generate orderId before save
orderSchema.pre("save", async function () {
  if (!this.orderId) {
    const count  = await mongoose.model("Order").countDocuments();
    const year   = new Date().getFullYear();
    this.orderId = `ORD-${year}-${String(count + 1).padStart(4, "0")}`;
  }
});

export const Order = mongoose.model("Order", orderSchema);

// ═════════════════════════════════════════════════════════════════════════════
//  PAYMENT MODEL
// ═════════════════════════════════════════════════════════════════════════════
const paymentSchema = new Schema(
  {
    orderId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "Order",
      required: true,
    },
    userId      : { type: mongoose.Schema.Types.ObjectId, ref: "User",       default: null },
   
    amount  : { type: Number,  required: true },
    currency: { type: String,  default: "INR" },

    method: {
      type    : String,
      enum    : ["COD", "UPI", "CARD", "NETBANKING", "WALLET", "RAZORPAY"],
      required: true,
    },

    status: {
      type   : String,
      enum   : ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },

    transactionId  : { type: String,             default: null },
    gatewayOrderId : { type: String,             default: null },
    gatewayResponse: { type: Schema.Types.Mixed },

    paidAt      : { type: Date },
    refundedAt  : { type: Date },
    refundAmount: { type: Number, default: 0 },

    customerEmail: { type: String },
    customerPhone: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);