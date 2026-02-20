const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getSummary,
  getRevenueByType,
  getReservationTrends,
  getTopItems,
  getCustomerSatisfaction,
  getDeliveryPerformance,
} = require("../controllers/dashboardController");

//  Admin Dashboard API
router.get("/summary", protect, adminOnly, getSummary);
router.get("/revenue-by-type", protect, adminOnly, getRevenueByType);
router.get("/reservations-trend", protect, adminOnly, getReservationTrends);
router.get("/top-items", protect, adminOnly, getTopItems);
router.get("/customer-satisfaction", protect, adminOnly, getCustomerSatisfaction);
router.get("/delivery-performance", protect, adminOnly, getDeliveryPerformance);
router.get("/stats", protect, adminOnly, getSummary);


module.exports = router;
