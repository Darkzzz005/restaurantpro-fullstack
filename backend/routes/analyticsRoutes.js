const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Import your models (names must match your project)
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Staff = require("../models/Staff");
const Menu = require("../models/Menu");
const Payment = require("../models/Payment");

// ✅ GET /api/analytics/summary (Admin)
router.get("/summary", protect, adminOnly, async (req, res) => {
  try {
    const [
      totalOrders,
      totalReservations,
      totalStaff,
      totalMenuItems,
      totalPayments,
    ] = await Promise.all([
      Order.countDocuments(),
      Reservation.countDocuments(),
      Staff.countDocuments(),
      Menu.countDocuments(),
      Payment.countDocuments(),
    ]);

    // Revenue (sum paid payments)
    const revenueAgg = await Payment.aggregate([
      { $match: { status: { $in: ["Paid", "Success", "paid", "success"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue = revenueAgg?.[0]?.total || 0;

    // Orders per day (last 7 days)
    const ordersPerDay = await Order.aggregate([
      {
        $group: {
          _id: { $substr: ["$createdAt", 0, 10] }, // YYYY-MM-DD
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalOrders,
      totalReservations,
      totalStaff,
      totalMenuItems,
      totalPayments,
      totalRevenue,
      ordersPerDay,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load analytics" });
  }
});

module.exports = router;
