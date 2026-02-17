const Allocation = require("../models/Allocation");

/* ================= CREATE ALLOCATION ================= */
exports.createAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.create(req.body);
    res.status(201).json(allocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= GET ALL ALLOCATIONS ================= */
exports.getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find().sort({ createdAt: -1 });
    res.status(200).json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ALLOCATION ================= */
exports.updateAllocation = async (req, res) => {
  try {
    const updated = await Allocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE ALLOCATION ================= */
exports.deleteAllocation = async (req, res) => {
  try {
    await Allocation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Allocation deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
