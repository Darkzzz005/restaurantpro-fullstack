const Review = require("../models/Review");
const Menu = require("../models/Menu");

//  Customer: add review
exports.createReview = async (req, res) => {
  try {
    const { menuItemId, rating, comment } = req.body;

    if (!menuItemId) return res.status(400).json({ message: "menuItemId is required" });
    if (!rating) return res.status(400).json({ message: "rating is required" });

    const menu = await Menu.findById(menuItemId);
    if (!menu) return res.status(404).json({ message: "Menu item not found" });

    const review = await Review.create({
      user: req.userId,
      menuItem: menuItemId,
      rating,
      comment: comment || "",
    });

    res.status(201).json(review);
  } catch (err) {
    // unique index error -> already reviewed
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this item" });
    }
    res.status(500).json({ message: err.message });
  }
};

//  Customer: my reviews
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.userId })
      .populate("menuItem", "name category price")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Public: reviews for a menu item
exports.getReviewsByMenuItem = async (req, res) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Admin: all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email role")
      .populate("menuItem", "name category price")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Admin: delete review
exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Review not found" });

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
