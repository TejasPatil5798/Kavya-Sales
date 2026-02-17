const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createLead,
  getLeads,
  getFollowUpLeads,
  updateLead,
  deleteLead,
  getMyLeads,
} = require("../controllers/leadController");

/* ================= USER ROUTES ================= */

// user can see only assigned leads
router.get("/my-leads", authMiddleware, getMyLeads);

// user CAN add / edit / delete (as you requested)
router.post("/", authMiddleware, createLead);
router.put("/:id", authMiddleware, updateLead);
router.delete("/:id", authMiddleware, deleteLead);

/* ================= ADMIN ROUTES ================= */

// admin can see all leads
router.get("/", authMiddleware, roleMiddleware("admin"), getLeads);

// admin follow-ups
router.get(
  "/follow-ups",
  authMiddleware,
  roleMiddleware("admin"),
  getFollowUpLeads
);

module.exports = router;
