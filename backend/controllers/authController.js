const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  let { email, password } = req.body;

  try {
    email = email.toLowerCase().trim();

    const user = await User.findOne({
      email,
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ JWT WITH CORRECT ID FIELD
    const token = jwt.sign(
      {
        id: user._id,          // 🔥 THIS IS THE KEY FIX
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ SEND COMPLETE USER DATA
    res.json({
      token,
      role: user.role,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      team: user.team || "",
      department: user.department || "",
      employeeId: user.employeeId || "",
    });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
