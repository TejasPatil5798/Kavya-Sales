const express = require("express");
const router = express.Router();
const { login, signupUser } = require("../controllers/authController");

router.post("/login", login);
router.post("/signup", signupUser);

module.exports = router;
