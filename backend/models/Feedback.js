const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    customerName: String,
    phone: String,
    rating: { type: Number, min: 1, max: 5 },
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
