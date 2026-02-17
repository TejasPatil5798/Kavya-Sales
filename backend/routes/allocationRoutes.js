const express = require("express");
const router = express.Router();

const {
  createAllocation,
  getAllocations,
  updateAllocation,
  deleteAllocation,
} = require("../controllers/allocationController");

/* CREATE */
router.post("/", createAllocation);

/* READ */
router.get("/", getAllocations);

/* UPDATE */
router.put("/:id", updateAllocation);

/* DELETE */
router.delete("/:id", deleteAllocation);

module.exports = router;
