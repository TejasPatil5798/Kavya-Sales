const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Lead = require("../models/Lead");


// GET Dashboard Summary
router.get("/summary", async (req, res) => {
  try {
    const { period = "weekly", date } = req.query;

    const selectedDate = date ? new Date(date) : new Date();
    let startDate = new Date(selectedDate);
    let endDate = new Date(selectedDate);

    // ================================
    // PERIOD FILTER (FOR TASKS & WEEKLY GRAPH)
    // ================================
    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    else if (period === "weekly") {
      const day = selectedDate.getDay(); // 0 = Sunday
      startDate.setDate(selectedDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    else if (period === "monthly") {
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // ================================
    // TASK PERFORMANCE
    // ================================
    const completedTasks = await Task.find({
      status: "Completed",
      taskDate: { $gte: startDate, $lte: endDate },
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
    // SALES TARGET (ALL ACTIVE STATUSES)
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
    // SALES ACHIEVED (DONE + CLOSED)
    // ================================
    const achievedStatuses = ["Done", "Closed"];

    const achievedResult = await Lead.aggregate([
      { $match: { status: { $in: achievedStatuses } } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]);

    const totalAchieved = achievedResult[0]?.total || 0;

    // ================================
    // ACHIEVEMENT PERCENT
    // ================================
    const achievementPercent =
      totalTarget > 0
        ? ((totalAchieved / totalTarget) * 100).toFixed(2)
        : 0;

    // ================================
    // SALES OVERVIEW GRAPH
    // ================================
    const graphStatuses = ["Done", "Closed"];
    let salesGraphData = [];

    // ---------- WEEKLY ----------
    if (period === "weekly") {
      const result = await Lead.aggregate([
        {
          $match: {
            status: { $in: graphStatuses },
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            total: { $sum: "$budget" },
          },
        },
      ]);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      salesGraphData = days.map((day, index) => {
        const found = result.find((r) => r._id === index + 1);
        return {
          label: day,
          amount: found ? found.total : 0,
        };
      });
    }

    // ---------- MONTHLY (CURRENT YEAR ONLY) ----------
    else if (period === "monthly") {
      const currentYear = new Date().getFullYear();

      const result = await Lead.aggregate([
        {
          $match: {
            status: { $in: graphStatuses },
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$budget" },
          },
        },
      ]);

      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      salesGraphData = months.map((month, index) => {
        const found = result.find((r) => r._id === index + 1);
        return {
          label: month,
          amount: found ? found.total : 0,
        };
      });
    }

    // ================================
    // SEND RESPONSE
    // ================================
    res.json({
      totalTarget,
      totalAchieved,
      achievementPercent,
      weeklySales: salesGraphData,
      topPerformers,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;