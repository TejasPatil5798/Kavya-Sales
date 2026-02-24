const User = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");

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

    // ✅ Name validation
    if (!name || !/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({
        message: "Name must contain only letters",
      });
    }

    // ✅ Email duplicate check
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Email id already exists",
      });
    }

    // ✅ Phone duplicate check
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          message: "Mobile number already exists",
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      team,
      monthlyCallTarget,
      monthlySalesTarget,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
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
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================
   ADMIN → GET ALL USERS
===================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 }) // newest first
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
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* =====================
   ADMIN → UPDATE USER
===================== */
exports.updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      team,
      monthlyCallTarget,
      monthlySalesTarget,
      isActive,
    } = req.body;

    // ✅ Name validation
    if (name && !/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({
        message: "Name must contain only letters",
      });
    }

    // ✅ Email duplicate check
    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({
          message: "Email id already exists",
        });
      }
    }

    // ✅ Phone duplicate check
    if (phone) {
      const phoneExists = await User.findOne({ phone });

      if (phoneExists && phoneExists._id.toString() !== req.params.id) {
        return res.status(400).json({
          message: "Mobile number already exists",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        role,
        team,
        monthlyCallTarget,
        monthlySalesTarget,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

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
    const userId = req.user.id || req.user._id;

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
   USER → UPLOAD PROFILE PICTURE
===================== */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true },
    ).select("-password");

    res.json({
      message: "Profile picture updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
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
