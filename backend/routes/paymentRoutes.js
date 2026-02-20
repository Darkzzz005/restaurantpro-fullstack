const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const crypto = require("crypto");

const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ GET all payments (admin can use later if you want)
router.get("/", protect, async (req, res) => {
  try {
    const rows = await Payment.find().sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load payments" });
  }
});

// ✅ CREATE Razorpay order (Customer Pay Now)
router.post("/razorpay/order", protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "orderId required" });

    const dbOrder = await Order.findById(orderId);
    if (!dbOrder) return res.status(404).json({ message: "Order not found" });

    // amount in paise
    const amount = Math.round(Number(dbOrder.totalAmount) * 100);

    const rpOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${dbOrder._id}`,
    });

    // save gateway order id inside order (optional but useful)
    dbOrder.gatewayOrderId = rpOrder.id;
    dbOrder.paymentMethod = "Razorpay";
    await dbOrder.save();

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      dbOrderId: dbOrder._id,
    });
  } catch (err) {
    console.log("razorpay/order error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

// ✅ VERIFY payment (Customer after payment)
router.post("/razorpay/verify", protect, async (req, res) => {
  try {
    const { dbOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!dbOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing fields for verification" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Mark order paid
    const order = await Order.findById(dbOrderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "Paid";
    order.paymentMethod = "Razorpay";
    order.gatewayOrderId = razorpay_order_id;
    order.gatewayPaymentId = razorpay_payment_id;
    order.paidAt = new Date();
    await order.save();

    // Create payment record for analytics revenue
    await Payment.create({
      order: order._id,
      amount: Number(order.totalAmount),
      method: "Razorpay",
      status: "Success",
    });

    res.json({ message: "Payment verified & order updated", order });
  } catch (err) {
    console.log("razorpay/verify error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;
