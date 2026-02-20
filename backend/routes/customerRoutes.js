const express = require("express");
const router = express.Router();

const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const { protect, adminOnly } = require("../middleware/authMiddleware");

//  Get all customers (admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ updatedAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer details + history (admin)
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const orders = await Order.find({ customerName: customer.customerName }).sort({ createdAt: -1 });
    const reservations = await Reservation.find({ customerName: customer.customerName }).sort({ createdAt: -1 });

    res.json({ customer, orders, reservations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
