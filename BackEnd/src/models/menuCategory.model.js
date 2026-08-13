import mongoose, { Schema } from "mongoose";

const menuCategorySchema = new Schema(
  {
   
    name : {
      type     : String,
      required : true,
      trim     : true,
    },
    description : {
      type    : String,
      trim    : true,
      default : "",
    },
    icon : {
      type    : String,
      trim    : true,
      default : "",
    },
    isActive : {
      type    : Boolean,
      default : true,
    },
    sortOrder : {
      type    : Number,
      default : 0,
    },
  },
  { timestamps: true }
);

menuCategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

export const MenuCategory = mongoose.model("MenuCategory", menuCategorySchema);