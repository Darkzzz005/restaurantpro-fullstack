const mongoose = require("mongoose");

const staffTaskSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["pending", "in_progress", "done"], default: "pending" },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StaffTask", staffTaskSchema);
