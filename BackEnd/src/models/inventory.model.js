import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema({
  // Standalone stock item
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: "pieces" }, // pieces, kg, liters, etc.
  reorderLevel: { type: Number, default: 5 },

  // Optional link to a menu item (not required for standalone stock)
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: "MenuItem",
    default: null,
  },

  costPerUnit: { type: Number, default: 0 },

  // Stock changes log
  stockHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["add", "deduct", "manual_adjust"], required: true },
    quantity: { type: Number, required: true },
    reason: String,
    reference: String, // order ID for deductions
  }],

  isActive: { type: Boolean, default: true },
  lastRestocked: Date,

}, { timestamps: true });

inventorySchema.index({ name: 1 });
inventorySchema.index({ isActive: 1 });

inventorySchema.methods.needsReorder = function() {
  return this.quantity <= this.reorderLevel;
};

export const Inventory = mongoose.model("Inventory", inventorySchema);
