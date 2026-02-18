const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const User = require("../models/User");

const {
  createUser,
  getAllUsers,
  deleteUser,
  getProfile,
  updateUser,
  resetPassword, // ✅ MISSING IMPORT (FIX)
  checkUserByEmail,
} = require("../controllers/userController");

/* =====================================================
   EMPLOYEE COUNT ROUTE
   ===================================================== */
router.get("/count/employees", authMiddleware, async (req, res) => {
  try {
    const count = await User.countDocuments({
      role: "employee",
      isActive: true,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee count" });
  }
});

router.get("/check", authMiddleware, checkUserByEmail);

/* =====================
   ADMIN ROUTES
   ===================== */
router.post("/create", authMiddleware, roleMiddleware("admin"), createUser);

router.post(
  "/reset-password/:id",
  authMiddleware,
  roleMiddleware("admin"), // ✅ ONLY ADMIN CAN RESET
  resetPassword,
);

router.get("/all", authMiddleware, roleMiddleware("admin"), getAllUsers);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

router.put("/:id", authMiddleware, roleMiddleware("admin"), updateUser);

/* =====================
   USER ROUTES
   ===================== */
router.get("/me", authMiddleware, getProfile);

module.exports = router;
