const Lead = require("../models/Lead");
const User = require("../models/User");

/* ================= GET ALL LEADS ================= */
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET FOLLOW UP LEADS ================= */
exports.getFollowUpLeads = async (req, res) => {
  try {
    const leads = await Lead.find({
      status: "Follow Up",
      followUpDate: { $exists: true },
    }).sort({ followUpDate: 1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CREATE LEAD ================= */
exports.createLead = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ CHECK USER EXISTS
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist with this email",
      });
    }

    // 2️⃣ CREATE LEAD & ASSIGN USER
    const lead = await Lead.create({
      ...req.body,
      assignedUser: user._id,
      createdBy: req.user.id,
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Create lead error:", error);
    res.status(500).json({ message: "Failed to create lead" });
  }
};


/* ================= UPDATE LEAD ================= */
exports.updateLead = async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE LEAD ================= */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await lead.deleteOne();
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET LOGGED IN USER LEADS ================= */
exports.getMyLeads = async (req, res) => {
  try {
    const leads = await Lead.find({
      assignedUser: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
