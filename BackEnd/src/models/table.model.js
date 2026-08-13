import mongoose, { Schema } from "mongoose";

// ─── Reservation sub-schema ───────────────────────────────────────────────────
const reservationSchema = new Schema(
  {
    userId: {
      type    : Schema.Types.ObjectId,
      ref     : "User",
      default : null,           
    },

    // Guest info (agar user logged-in nahi hai)
    guestName  : { type: String, trim: true },
    guestPhone : { type: String, trim: true },
    guestEmail : { type: String, trim: true, lowercase: true },

    // Reservation details
    date          : { type: Date,   required: true },          
    partySize     : { type: Number, required: true, min: 1 }, 
    durationMins  : { type: Number, default: 60 },             
    specialRequest: { type: String, trim: true, default: null },

    // Status
    status: {
      type    : String,
      enum    : ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default : "pending",
    },

    confirmedBy : { type: Schema.Types.ObjectId, ref: "User", default: null },  
    cancelReason: { type: String, default: null },
    checkedInAt : { type: Date,   default: null },
    checkedOutAt: { type: Date,   default: null },
  },
  { timestamps: true }
);

// ─── Main table schema ────────────────────────────────────────────────────────
const tableSchema = new Schema(
  {
    restaurantId: {
      type     : Schema.Types.ObjectId,
      ref      : "Restaurant",
      required : true,
      index    : true,
    },
    tableLabel: {
      type     : String,
      required : true,
      trim     : true,
    },

    // Current occupant (quick reference)
    userId: {
      type    : Schema.Types.ObjectId,
      ref     : "User",
      default : null,
    },

    // Table capacity
    capacity: {
      type    : Number,
      default : 4,
      min     : 1,
    },

   
    section: {
      type    : String,
      trim    : true,
      default : null,
    },

    status: {
      type    : String,
      enum    : ["available", "occupied", "reserved"],
      default : "available",
    },

    // All reservations for this table (history + upcoming)
    reservations: [reservationSchema],
  },
  { timestamps: true }
);

// Ek restaurant me tableLabel unique hogi
tableSchema.index({ restaurantId: 1, tableLabel: 1 }, { unique: true });

export const Table = mongoose.model("Table", tableSchema);