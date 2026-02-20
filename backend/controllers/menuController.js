const Menu = require("../models/Menu");

//  Public: Get menu (supports filters)
exports.getMenu = async (req, res) => {
  try {
    const { category, available, q, tag } = req.query;

    const filter = {};

    if (category) filter.category = category;

    // available=true/false
    if (available === "true") filter.isAvailable = true;
    if (available === "false") filter.isAvailable = false;

    // search by name/description
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // tag=veg (or tag=gluten-free)
    if (tag) {
      filter.dietaryTags = { $in: [tag] };
    }

    const items = await Menu.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Admin: Add item
exports.createMenuItem = async (req, res) => {
  try {
    const item = await Menu.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  Admin: Update item
exports.updateMenuItem = async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Menu item not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  Admin: Delete item
exports.deleteMenuItem = async (req, res) => {
  try {
    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Admin: Toggle availability quickly
exports.toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body; // true/false

    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      { isAvailable: Boolean(isAvailable) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Menu item not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
