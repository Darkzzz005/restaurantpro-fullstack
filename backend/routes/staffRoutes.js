// backend/routes/staffRoutes.js
const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const Staff = require("../models/Staff");
const Attendance = require("../models/Attendance");
const Task = require("../models/Task");


// ✅ ADMIN: STAFF LIST

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Error fetching staff" });
  }
});


// ADMIN: CREATE STAFF

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newStaff = new Staff({ name, email, role });
    await newStaff.save();

    res.status(201).json(newStaff);
  } catch (err) {
    res.status(500).json({ message: "Error creating staff" });
  }
});


//  ADMIN: ATTENDANCE LIST

router.get("/attendance", protect, adminOnly, async (req, res) => {
  try {
    const records = await Attendance.find()
      .sort({ createdAt: -1 })
      .populate("staff", "name email role");

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to load attendance" });
  }
});


//  ADMIN: MARK ATTENDANCE

router.post("/attendance", protect, adminOnly, async (req, res) => {
  try {
    const { staff, date, status, notes, checkIn, checkOut } = req.body;

    if (!staff || !date) {
      return res.status(400).json({ message: "staff and date are required" });
    }

    const saved = await Attendance.create({
      staff,
      date,
      status: status || "Present",
      notes: notes || "",
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      markedBy: req.user?._id,
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to save attendance" });
  }
});


//  ADMIN: ASSIGN TASK

router.post("/assign-task", protect, adminOnly, async (req, res) => {
  try {
    const { staff, title, description, priority, dueDate } = req.body;

    if (!staff || !title) {
      return res.status(400).json({ message: "Staff and title are required" });
    }

    const task = await Task.create({
      staff: staff, 
      title,
      description: description || "",
      priority: priority || "Medium",
      dueDate: dueDate || null,
      status: "Pending",
      assignedBy: req.user?._id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.log("ASSIGN TASK ERROR:", err);
    res.status(500).json({ message: "Failed to assign task" });
  }
});


//  ADMIN: GET ALL TASKS

router.get("/all-tasks", protect, adminOnly, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("staff", "name email role") 
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.log("GET ALL TASKS ERROR:", err);
    res.status(500).json({ message: "Failed to load tasks" });
  }
});


//  STAFF SIDE ROUTES


//  STAFF: GET MY TASKS
router.get("/my/tasks", protect, async (req, res) => {
  try {
    //  Only staff
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Only staff can view tasks" });
    }

    const tasks = await Task.find({ staff: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.log("GET MY TASKS ERROR:", err);
    res.status(500).json({ message: "Failed to load my tasks" });
  }
});

//  STAFF: UPDATE MY TASK STATUS
router.patch("/my/tasks/:taskId/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Only staff can update tasks" });
    }

    const { taskId } = req.params;
    const { status } = req.body;

    const allowed = ["Pending", "In Progress", "Completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, staff: req.user._id }, 
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found or not yours" });
    }

    res.json(task);
  } catch (err) {
    console.log("UPDATE TASK ERROR:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
});

//  STAFF: CHECK-IN
router.post("/my/attendance/check-in", protect, async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Only staff can check-in" });
    }

    const staffId = req.user?._id;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    let record = await Attendance.findOne({ staff: staffId, date: today });

    if (!record) {
      record = await Attendance.create({
        staff: staffId,
        date: today,
        status: "Present",
        checkIn: new Date(),
        checkOut: null,
        markedBy: staffId,
        notes: "",
      });
    } else {
      record.checkIn = new Date();
      record.status = "Present";
      record.markedBy = staffId;
      await record.save();
    }

    return res.json(record);
  } catch (err) {
    console.log("CHECK-IN ERROR:", err);
    return res.status(500).json({ message: "Check-in failed", error: err.message });
  }
});

//  STAFF: CHECK-OUT
router.post("/my/attendance/check-out", protect, async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Only staff can check-out" });
    }

    const staffId = req.user?._id;
    const today = new Date().toISOString().slice(0, 10);

    const record = await Attendance.findOne({ staff: staffId, date: today });

    if (!record) {
      return res.status(400).json({ message: "No check-in found for today" });
    }

    record.checkOut = new Date();
    record.markedBy = staffId;
    await record.save();

    return res.json(record);
  } catch (err) {
    console.log("CHECK-OUT ERROR:", err);
    return res.status(500).json({ message: "Check-out failed", error: err.message });
  }
});

module.exports = router;
