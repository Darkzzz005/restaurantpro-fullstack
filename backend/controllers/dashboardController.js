const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Review = require("../models/Review");


const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfMonth = (d = new Date()) => {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
};

//  SUMMARY CARDS (orders, revenue, reservations, customers approx)
exports.getSummary = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());

    const [totalOrders, todayOrders, monthOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    const [totalRevenueAgg, todayRevenueAgg, monthRevenueAgg] = await Promise.all([
      Order.aggregate([{ $match: { paymentStatus: "Paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.aggregate([{ $match: { paymentStatus: "Paid", createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.aggregate([{ $match: { paymentStatus: "Paid", createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const todayRevenue = todayRevenueAgg[0]?.total || 0;
    const monthRevenue = monthRevenueAgg[0]?.total || 0;

    const [totalReservations, todayReservations] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({ createdAt: { $gte: today } }),
    ]);

    res.json({
      totalOrders,
      todayOrders,
      monthOrders,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalReservations,
      todayReservations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//   Revenue by service type (Dining/Parcel/Delivery)
exports.getRevenueByType = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: "$orderType",
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json(
      data.map((x) => ({
        orderType: x._id || "Unknown",
        revenue: x.revenue,
        orders: x.orders,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Reservation trends + table turnover (simple + meaningful)
exports.getReservationTrends = async (req, res) => {
  try {
    // last 7 days trend
    const from = new Date();
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    const trend = await Reservation.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] },
          },
          waiting: {
            $sum: { $cond: [{ $eq: ["$status", "Waiting"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // table turnover (how many confirmed reservations per table)
    const turnover = await Reservation.aggregate([
      { $match: { status: "Confirmed", tableNo: { $ne: null } } },
      { $group: { _id: "$tableNo", confirmedReservations: { $sum: 1 } } },
      { $sort: { confirmedReservations: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      last7Days: trend.map((d) => ({
        date: d._id,
        total: d.count,
        confirmed: d.confirmed,
        waiting: d.waiting,
        cancelled: d.cancelled,
      })),
      topTablesByTurnover: turnover.map((t) => ({
        tableNo: t._id,
        confirmedReservations: t.confirmedReservations,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Popular dishes / menu analysis (from order items)
exports.getTopItems = async (req, res) => {
  try {
    const top = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
    ]);

    res.json(
      top.map((x) => ({
        itemName: x._id,
        quantitySold: x.quantitySold,
        revenue: x.revenue,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//   Customer satisfaction metrics
exports.getCustomerSatisfaction = async (req, res) => {
  try {
    if (!Review) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        note: "Review module not added yet",
      });
    }

    const [avgAgg, breakdownAgg, totalReviews] = await Promise.all([
      Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
      Review.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }]),
      Review.countDocuments(),
    ]);

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdownAgg.forEach((b) => {
      breakdown[b._id] = b.count;
    });

    res.json({
      averageRating: Number((avgAgg[0]?.avg || 0).toFixed(2)),
      totalReviews,
      ratingBreakdown: breakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Delivery performance tracking 
exports.getDeliveryPerformance = async (req, res) => {
  try {
    // We estimate delivery performance using completed orders:
    // completionTime = updatedAt - createdAt for Completed delivery orders
    const perf = await Order.aggregate([
      { $match: { orderType: "Delivery", status: "Completed" } },
      {
        $project: {
          minutes: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgMinutes: { $avg: "$minutes" },
          minMinutes: { $min: "$minutes" },
          maxMinutes: { $max: "$minutes" },
          completedDeliveries: { $sum: 1 },
        },
      },
    ]);

    const row = perf[0] || {
      avgMinutes: 0,
      minMinutes: 0,
      maxMinutes: 0,
      completedDeliveries: 0,
    };

    res.json({
      completedDeliveries: row.completedDeliveries,
      avgMinutes: Number((row.avgMinutes || 0).toFixed(2)),
      minMinutes: Number((row.minMinutes || 0).toFixed(2)),
      maxMinutes: Number((row.maxMinutes || 0).toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
