const Reservation = require("../models/Reservation");


//  Customer: Create reservation
exports.createReservation = async (req, res) => {
  try {
    const { customerName, phone, date, time, guests, notes } = req.body;

    // Check if table already booked at same time
    const existing = await Reservation.findOne({
      date,
      time,
      tableNo: req.body.tableNo,
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (existing) {
      return res.status(400).json({ message: "Table already booked at this time" });
    }

    const reservation = await Reservation.create({
      user: req.user.id,
      customerName,
      phone,
      date,
      time,
      guests,
      notes,
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  Customer: View own reservations
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  Admin: View all reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  Admin: Update status (Confirm / Cancel / Waiting)
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Admin: Assign table
exports.assignTable = async (req, res) => {
  try {
    const { tableNo } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    reservation.tableNo = tableNo;
    reservation.status = "Confirmed";

    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
