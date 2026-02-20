const Order = require("../models/Order");
const Customer = require("../models/Customer");

//  MARK ORDER AS PAID (admin)
exports.markOrderPaid = async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "Paid";
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.transactionId = transactionId || "";
    order.paidAt = new Date();

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Payment update failed", error: err.message });
  }
};

//  CREATE ORDER (customer)
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      items,
      totalAmount,
      orderType,
      deliveryAddress,
      scheduledTime,
    } = req.body;

    //  save user id in order (so we can show only their orders)
    const order = await Order.create({
      user: req.userId, 

      customerName,
      phone: phone || "",
      items,
      totalAmount,
      orderType: orderType || "Parcel",
      deliveryAddress: deliveryAddress || "",
      scheduledTime: scheduledTime || "",
    });

    //  Update/Create customer profile AFTER order is created
    await Customer.findOneAndUpdate(
      { customerName: order.customerName },
      {
        $set: { phone: order.phone || "" },
        $inc: {
          totalOrders: 1,
          totalSpent: order.totalAmount,
          loyaltyPoints: 1,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  GET ALL ORDERS (admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  UPDATE ORDER (admin)
exports.updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  DELETE ORDER (admin)
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  GET MY ORDERS (customer)
exports.getMyOrders = async (req, res) => {
  try {
    //  match the schema field: user (not userId)
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
