const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { changePassword } = require("../controllers/passwordController");

router.put("/change", authMiddleware, changePassword);

module.exports = router;
