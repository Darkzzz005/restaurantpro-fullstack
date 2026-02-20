const User = require("../models/User");
const StaffTask = require("../models/StaffTask");
const Attendance = require("../models/Attendance");

// helper: YYYY-MM-DD
const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ✅ Admin: list staff users
exports.getStaffList = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" }).select("_id name email role");
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: assign task to staff
exports.assignTask = async (req, res) => {
  try {
    const { staffId, title, description, priority, dueDate } = req.body;

    if (!staffId || !title) {
      return res.status(400).json({ message: "staffId and title are required" });
    }

    const staffUser = await User.findById(staffId);
    if (!staffUser || staffUser.role !== "staff") {
      return res.status(404).json({ message: "Staff user not found" });
    }

    const task = await StaffTask.create({
      staff: staffId,
      title,
      description: description || "",
      priority: priority || "Medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedBy: req.userId,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: view all tasks (optionally filter by staffId)
exports.getAllTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.staffId) filter.staff = req.query.staffId;

    const tasks = await StaffTask.find(filter)
      .populate("staff", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Staff: view my tasks
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await StaffTask.find({ staff: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Staff: update my task status (Assigned/In Progress/Completed)
exports.updateMyTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await StaffTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (String(task.staff) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.status = status || task.status;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: update any task (cancel etc.)
exports.adminUpdateTask = async (req, res) => {
  try {
    const updated = await StaffTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Staff: check-in (creates/updates today attendance)
exports.checkIn = async (req, res) => {
  try {
    const date = todayStr();

    const record = await Attendance.findOneAndUpdate(
      { staff: req.userId, date },
      {
        $setOnInsert: { staff: req.userId, date },
        $set: { checkIn: new Date(), status: "Present", markedBy: req.userId },
      },
      { upsert: true, new: true }
    );

    res.json(record);
  } catch (err) {
    // duplicate index conflict safety
    res.status(500).json({ message: err.message });
  }
};

// ✅ Staff: check-out
exports.checkOut = async (req, res) => {
  try {
    const date = todayStr();

    const record = await Attendance.findOne({ staff: req.userId, date });
    if (!record) return res.status(404).json({ message: "No check-in record found for today" });

    record.checkOut = new Date();
    record.markedBy = req.userId;
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: view attendance (optional filter date or staffId)
exports.getAttendance = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.staffId) filter.staff = req.query.staffId;

    const records = await Attendance.find(filter)
      .populate("staff", "name email role")
      .populate("markedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: mark absent/leave manually
exports.adminMarkAttendance = async (req, res) => {
  try {
    const { staffId, date, status, notes } = req.body;

    if (!staffId || !date || !status) {
      return res.status(400).json({ message: "staffId, date, status are required" });
    }

    const record = await Attendance.findOneAndUpdate(
      { staff: staffId, date },
      {
        $setOnInsert: { staff: staffId, date },
        $set: { status, notes: notes || "", markedBy: req.userId },
      },
      { upsert: true, new: true }
    );

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
