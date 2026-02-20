const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: String, // Chef/Waiter/Delivery/Admin
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
