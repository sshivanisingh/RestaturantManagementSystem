import mongoose, { Schema } from "mongoose";

// ═════════════════════════════════════════════════════════════════════════════
// ORDER ITEM
// ═════════════════════════════════════════════════════════════════════════════

const orderItemSchema = new Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    // Snapshot of menu item data at order time
    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

// ═════════════════════════════════════════════════════════════════════════════
// ORDER MODEL
// ═════════════════════════════════════════════════════════════════════════════

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    // ─────────────────────────────────────────────────────────────────────
    // Delivery Boy
    // ─────────────────────────────────────────────────────────────────────

    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },

    deliveryBoyAssignedAt: {
      type: Date,
      default: null,
    },

    // ─────────────────────────────────────────────────────────────────────
    // Items
    // ─────────────────────────────────────────────────────────────────────

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // ─────────────────────────────────────────────────────────────────────
    // Delivery Information
    // ─────────────────────────────────────────────────────────────────────

    deliveryInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        default: null,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        default: null,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,
        enum: ["delivery", "pickup"],
        default: "delivery",
      },
    },

    // ─────────────────────────────────────────────────────────────────────
    // Customer Location
    // ─────────────────────────────────────────────────────────────────────

    customerLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: null,
      },
    },

    // ─────────────────────────────────────────────────────────────────────
    // Pricing
    // ─────────────────────────────────────────────────────────────────────

    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      tax: {
        type: Number,
        default: 0,
        min: 0,
      },

      deliveryCharge: {
        type: Number,
        default: 0,
        min: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    couponCode: {
      type: String,
      default: null,
    },

    // ─────────────────────────────────────────────────────────────────────
    // PAYMENT METHOD
    // ─────────────────────────────────────────────────────────────────────

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD", "NETBANKING", "WALLET", "RAZORPAY"],
      default: "COD",
    },

    // ─────────────────────────────────────────────────────────────────────
    // ORDER STATUS
    // ─────────────────────────────────────────────────────────────────────

    orderstatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    // ─────────────────────────────────────────────────────────────────────
    // DELIVERY STATUS
    // ─────────────────────────────────────────────────────────────────────

    deliverystatus: {
      type: String,
      enum: ["pending", "assigned", "out_for_delivery", "delivered"],
      default: "pending",
    },

    // ─────────────────────────────────────────────────────────────────────
    // STATUS HISTORY
    // ─────────────────────────────────────────────────────────────────────

    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },

        note: {
          type: String,
          default: "",
        },
      },
    ],

    notes: {
      type: String,
      default: null,
    },

    estimatedTime: {
      type: Number,
      default: null,
    },

    isGuestOrder: {
      type: Boolean,
      default: false,
    },

    // ─────────────────────────────────────────────────────────────────────
    // Delivery Rating
    // ─────────────────────────────────────────────────────────────────────

    deliveryRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      comment: {
        type: String,
        default: null,
      },

      ratedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

// ═════════════════════════════════════════════════════════════════════════════
// AUTO GENERATE ORDER ID
// ═════════════════════════════════════════════════════════════════════════════

orderSchema.pre("save", async function () {
  if (!this.orderId) {
    const count = await mongoose.model("Order").countDocuments();

    const year = new Date().getFullYear();

    this.orderId = `ORD-${year}-${String(count + 1).padStart(4, "0")}`;
  }
});

export const Order = mongoose.model("Order", orderSchema);

// ═════════════════════════════════════════════════════════════════════════════
// PAYMENT MODEL
// ═════════════════════════════════════════════════════════════════════════════

const paymentSchema = new Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    method: {
      type: String,
      enum: ["COD", "UPI", "CARD", "NETBANKING", "WALLET", "RAZORPAY"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },

    transactionId: {
      type: String,
      default: null,
    },

    gatewayOrderId: {
      type: String,
      default: null,
    },

    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    customerEmail: {
      type: String,
      default: null,
    },

    customerPhone: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Payment = mongoose.model("Payment", paymentSchema);
