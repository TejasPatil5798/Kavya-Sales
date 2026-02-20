const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* =====================
   ADMIN → CREATE USER
   ===================== */
exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      team,
      monthlyCallTarget,
      monthlySalesTarget,
    } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, // 🔐 will be hashed by schema
      role,
      phone,
      team,
      monthlyCallTarget,
      monthlySalesTarget,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================
   ADMIN → RESET PASSWORD
   ===================== */
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ SET PLAIN PASSWORD
    // Schema pre-save hook will hash it
    user.password = password;

    await user.save(); // 🔥 THIS MUST WORK

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("🔥 Reset password error:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message, // 👈 helps debugging
    });
  }
};

/* =====================
   ADMIN → GET ALL USERS
   ===================== */
/* =====================
   ADMIN → GET ALL USERS
   ===================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })   // ✅ NEWEST FIRST
      .select("-password");

    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* =====================
   ADMIN → DELETE USER
   ===================== */
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

/* =====================
   ADMIN → UPDATE USER
   ===================== */
/* =====================
   ADMIN → UPDATE USER
   ===================== */
exports.updateUser = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔥 1️⃣ Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }
    }

    // 🔥 2️⃣ Proceed with update
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);

    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

/* =====================
   USER → PROFILE
   ===================== */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // 🔥 FIX

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================
   CHECK USER BY EMAIL
   ===================== */
exports.checkUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    res.json({ exists: !!user });
  } catch (err) {
    console.error("Check user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
