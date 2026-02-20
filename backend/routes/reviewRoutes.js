const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createReview,
  getMyReviews,
  getReviewsByMenuItem,
  getAllReviews,
  deleteReview,
} = require("../controllers/reviewController");

//  Public
router.get("/menu/:menuId", getReviewsByMenuItem);

//  Customer
router.post("/", protect, createReview);
router.get("/my", protect, getMyReviews);

//  Admin
router.get("/", protect, adminOnly, getAllReviews);
router.delete("/:id", protect, adminOnly, deleteReview);

module.exports = router;
