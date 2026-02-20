const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    //  Link to logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //  Which menu item is reviewed
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

//  prevent one user reviewing same item multiple times
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
