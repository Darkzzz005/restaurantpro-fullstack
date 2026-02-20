const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

//  Customer places order (must be logged in)
router.post("/", protect, createOrder);

//  Customer: view only their orders
router.get("/my", protect, getMyOrders);

// Admin: manage all orders
router.get("/", protect, adminOnly, getOrders);
router.put("/:id", protect, adminOnly, updateOrder);
router.delete("/:id", protect, adminOnly, deleteOrder);

module.exports = router;
