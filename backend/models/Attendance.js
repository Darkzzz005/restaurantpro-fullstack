const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: { type: String, required: true }, // YYYY-MM-DD

    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      default: "Present",
    },

    notes: { type: String, default: "" },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin id (or staff self check-in)
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ one record per staff per date
attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
