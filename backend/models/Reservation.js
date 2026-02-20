const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    // Link to logged in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: { type: String, required: true },
    phone: { type: String, default: "" },

    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm

    guests: { type: Number, required: true },

    // Table assigned by admin (optional initially)
    tableNo: { type: Number, default: null },

    notes: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Waiting"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
