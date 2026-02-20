const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // ✅ MUST match what frontend/backend uses: "staff"
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, default: "" },

    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },

    // store as Date (recommended)
    dueDate: { type: Date, default: null },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
