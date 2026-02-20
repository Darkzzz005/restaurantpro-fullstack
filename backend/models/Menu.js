const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    price: { type: Number, required: true, min: 0 },

    category: { type: String, required: true, trim: true },

    image: { type: String, default: "" },

    //  Availability tracking
    isAvailable: { type: Boolean, default: true },

    //  Customization / filters
    dietaryTags: {
      type: [String],
      default: [], 
    },

    //  quick filters
    spiceLevel: { type: String, enum: ["none", "mild", "medium", "hot"], default: "none" },

    //  Analytics support 
    ordersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);
