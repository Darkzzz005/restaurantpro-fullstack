const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
const Order = require("../models/Order");

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "orderId is required" });

    const dbOrder = await Order.findById(orderId);
    if (!dbOrder) return res.status(404).json({ message: "Order not found" });

    
    if (String(dbOrder.user) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(dbOrder.totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${dbOrder._id}`,
      notes: { dbOrderId: String(dbOrder._id) },
    });

    dbOrder.gatewayOrderId = rpOrder.id;
    dbOrder.paymentMethod = "Razorpay";
    await dbOrder.save();

    res.json({
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      dbOrderId: dbOrder._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create Razorpay order", error: err.message });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { dbOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!dbOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const dbOrder = await Order.findById(dbOrderId);
    if (!dbOrder) return res.status(404).json({ message: "Order not found" });

    if (String(dbOrder.user) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed (invalid signature)" });
    }

    dbOrder.paymentStatus = "Paid";
    dbOrder.gatewayOrderId = razorpay_order_id;
    dbOrder.gatewayPaymentId = razorpay_payment_id;
    dbOrder.paymentMethod = "Razorpay";
    dbOrder.paidAt = new Date();
    await dbOrder.save();

    res.json({ message: "Payment verified successfully", order: dbOrder });
  } catch (err) {
    res.status(500).json({ message: "Payment verification error", error: err.message });
  }
};
