const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ✅ Import Reservation model (THIS WAS MISSING)
const Reservation = require("../models/Reservation");


const {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  assignTable,
} = require("../controllers/reservationController");

// =====================
// Customer
// =====================
router.post("/", protect, createReservation);
router.get("/my", protect, getMyReservations);

// =====================
// Admin
// =====================
router.get("/", protect, adminOnly, getAllReservations);
router.patch("/:id/status", protect, adminOnly, updateReservationStatus);
router.patch("/:id/assign-table", protect, adminOnly, assignTable);

// =====================
// ✅ CHECK AVAILABILITY
// GET /api/reservations/availability?date=YYYY-MM-DD&time=HH:mm
// =====================
router.get("/availability", async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: "date and time are required" });
    }

    // ✅ Find booked tables for that date & time (excluding Cancelled)
    const booked = await Reservation.find({
      date,
      time,
      status: { $ne: "Cancelled" },
    }).select("tableNumber table");

    // ✅ support both field names: tableNumber OR table
    const bookedTables = booked.map((r) => r.tableNumber || r.table).filter(Boolean);

    res.json({ bookedTables });
  } catch (err) {
    console.log("AVAILABILITY ERROR:", err);
    res.status(500).json({ message: "Failed to check availability" });
  }
});

module.exports = router;
