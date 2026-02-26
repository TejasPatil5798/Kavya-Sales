const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Lead = require("../models/Lead");

// GET Dashboard Summary
router.get("/summary", async (req, res) => {
  try {
    const { period = "weekly" } = req.query;

    const now = new Date();
    let startDate = new Date();

    // ================================
    // PERIOD FILTER (TASKS)
    // ================================
    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      startDate.setMonth(now.getMonth() - 1);
    }

    // ================================
    // TASK PERFORMANCE (UNCHANGED)
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
    // 🔥 SALES TARGET (ALL ACTIVE STATUSES)
    // ================================
    const targetStatuses = [
      "Interested",
      "Open",
      "Follow Up",
      "Pending",
      "Done",
      "Closed",
    ];

    const targetResult = await Lead.aggregate([
      { $match: { status: { $in: targetStatuses } } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]);

    const totalTarget = targetResult[0]?.total || 0;

    // ================================
    // 🔥 SALES ACHIEVED (DONE + CLOSED ONLY)
    // ================================
    const achievedStatuses = ["Done", "Closed"];

    const achievedResult = await Lead.aggregate([
      { $match: { status: { $in: achievedStatuses } } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]);

    const totalAchieved = achievedResult[0]?.total || 0;

    // ================================
    // 🎯 ACHIEVEMENT PERCENT
    // ================================
    const achievementPercent =
      totalTarget > 0
        ? ((totalAchieved / totalTarget) * 100).toFixed(2)
        : 0;

    // ================================
    // SEND RESPONSE
    // ================================
    res.json({
      totalTarget,
      totalAchieved,
      achievementPercent,
      weeklySales: [],
      topPerformers,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;