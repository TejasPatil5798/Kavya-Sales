const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Lead = require("../models/Lead");   // ✅ ADD THIS

// GET Dashboard Summary
router.get("/summary", async (req, res) => {
  try {
    const { period = "weekly" } = req.query;

    const now = new Date();
    let startDate = new Date();

    // ✅ FILTER BASED ON PERIOD
    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      startDate.setMonth(now.getMonth() - 1);
    }

    // ================================
    // ✅ TASK PERFORMANCE (YOUR OLD LOGIC)
    // ================================
    const completedTasks = await Task.find({
      status: "Completed",
      taskDate: { $gte: startDate },
    });

    const performanceMap = {};

    completedTasks.forEach((task) => {
      if (!performanceMap[task.userMail]) {
        performanceMap[task.userMail] = 0;
      }
      performanceMap[task.userMail]++;
    });

    let topPerformers = Object.keys(performanceMap).map((email) => ({
      name: email,
      achievement: performanceMap[email],
    }));

    topPerformers.sort((a, b) => b.achievement - a.achievement);
    topPerformers = topPerformers.slice(0, 10);

    // ================================
    // 🔥 NEW: SALES TARGET FROM LEADS
    // ================================

    const validStatuses = [
      "Interested",
      "Done",
      "Open",
      "Closed",
      "Follow Up",
      "Pending",
    ];

    const salesResult = await Lead.aggregate([
      {
        $match: {
          status: { $in: validStatuses },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$budget" },
        },
      },
    ]);

    const totalTarget = salesResult[0]?.total || 0;

    // ================================
    // ✅ SEND RESPONSE TO FRONTEND
    // ================================
    res.json({
      totalTarget,          // 👈 THIS WILL SHOW IN SALES TARGET CARD
      totalAchieved: 0,
      achievementPercent: 0,
      weeklySales: [],
      topPerformers,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;