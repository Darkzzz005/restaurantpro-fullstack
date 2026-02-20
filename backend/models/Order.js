const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    //  NEW: link order to logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: { type: String, required: true },
    phone: { type: String, default: "" },

    items: [{ name: String, price: Number, quantity: Number }],

    totalAmount: { type: Number, required: true },

    status: { type: String, default: "Pending" }, 

    orderType: { type: String, default: "Parcel" },
    deliveryAddress: { type: String, default: "" },
    scheduledTime: { type: String, default: "" },

    //  Payment fields
    paymentStatus: { type: String, default: "Unpaid" }, // Unpaid/Paid/Refunded
    paymentMethod: { type: String, default: "Cash" },   // Cash/UPI/Card/Netbanking/Wallet
    gatewayOrderId: { type: String, default: "" },      // Razorpay order_id
    gatewayPaymentId: { type: String, default: "" },    // Razorpay payment_id
    paidAt: { type: Date },

    //  Refund fields
    refundId: { type: String, default: "" },
    refundedAt: { type: Date },

    //  Invoice fields
    invoiceNumber: { type: String, default: "" },
    invoiceUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
