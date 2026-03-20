const express = require("express");
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  toggleBlockUser, 
  getAllUsers   
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get users
router.get("/users",  getAllUsers);

// Block user
router.put("/block-user/:userId", protect, toggleBlockUser);

module.exports = router;