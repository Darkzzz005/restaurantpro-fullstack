require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const { protect, adminOnly } = require("./middleware/authMiddleware");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dashboardRoutes = require("./routes/dashboard");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const staffRoutes = require("./routes/staffRoutes");



const app = express();


// MIDDLEWARE

app.use(cors());
app.use(express.json());


// ROUTES


// Auth
app.use("/api/auth", authRoutes);

// Menu
app.use("/api/menu", menuRoutes);

// Orders
app.use("/api/orders", orderRoutes);

// Reservations
app.use("/api/reservations", reservationRoutes);

// Customers
app.use("/api/customers", customerRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Payments
app.use("/api/payments", paymentRoutes);

// Invoice Static Folder
app.use("/invoices", express.static(path.join(__dirname, "invoices")));

// Reviews
app.use("/api/reviews", reviewRoutes);

// Staff
app.use("/api/staff", staffRoutes);

// Admin Dashboard API
app.use("/api/analytics", require("./routes/analyticsRoutes"));





// TEST ROUTES


// Public
app.get("/", (req, res) => {
  res.send("RestaurantPro API is running...");
});

// Protected Test
app.get("/api/test", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

// Admin Test
app.get("/api/admin-test", protect, adminOnly, (req, res) => {
  res.json({
    message: "Welcome Admin 👑",
    user: req.user,
  });
});


// DATABASE CONNECTION

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));


// SERVER START

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
