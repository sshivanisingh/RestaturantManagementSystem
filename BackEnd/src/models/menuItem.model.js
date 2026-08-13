import mongoose, { Schema } from "mongoose";

const menuItemSchema = new Schema(
  {
    // restaurantId : {
    //   type     : Schema.Types.ObjectId,
    //   ref      : "Restaurant",
    //   required : true,
    //   index    : true,
    // },
    categoryId : {
      type     : Schema.Types.ObjectId,
      ref      : "MenuCategory",
      required : true,
      index    : true,
    },

    // ─── Basic Info ──────────────────────────────
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
    image : {
      type    : String,  // Cloudinary URL
      default : "",
    },

    // ─── Pricing ─────────────────────────────────
    price : {
      type     : Number,
      required : true,
      min      : 0,
    },
    discountPercent : {
      type    : Number,
      default : 0,
      min     : 0,
      max     : 100,
    },
    discountedPrice : {
      type    : Number,
      default : 0,
    },

    // ─── Item Details ─────────────────────────────
    type : {
      type     : String,
      enum     : ["Veg", "Non-Veg", "Vegan"],
      required : true,
    },

    
    preparationTime : {
      type    : Number,  // minutes mein
      default : 0,
    },
    servingSize : {
      type    : String,
      default : "1 person",
      trim    : true,
    },
     

    // ─── Nutrition (optional) ────────────────────
    nutrition : {
      calories : { type: Number, default: 0 },
      protein  : { type: Number, default: 0 },
      carbs    : { type: Number, default: 0 },
      fat      : { type: Number, default: 0 },
    },

    // ─── Ingredients ─────────────────────────────
    ingredients : {
      type    : [String],
      default : [],
    },

 
    rating : {
      averageRating : {
        type    : Number,
        default : 0,
        min     : 0,
        max     : 5,
      },
      ratingCount : {
        type    : Number,
        default : 0,
        min     : 0,
      },
    },

    // ─── Status ──────────────────────────────────
    isActive      : { type: Boolean, default: true  },
    isAvailable   : { type: Boolean, default: true  },
    isBestSeller  : { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Discounted price auto calculate karo save se pehle
menuItemSchema.pre("save", function (next) {
  if (this.discountPercent > 0) {
    this.discountedPrice = parseFloat(
      (this.price - (this.price * this.discountPercent) / 100).toFixed(2)
    );
  } else {
    this.discountedPrice = this.price;
  }
});

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);