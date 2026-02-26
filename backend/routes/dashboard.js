const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Lead = require("../models/Lead");

// GET Dashboard Summary
router.get("/summary", async (req, res) => {
  try {
    const { period = "weekly", date } = req.query;

    // ✅ Use selected date from frontend
    const baseDate = date ? new Date(date) : new Date();

    let startDate;
    let endDate;

    // ================================
    // DATE FILTER LOGIC
    // ================================
    if (period === "weekly") {
      startDate = new Date(baseDate);
      startDate.setDate(baseDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(baseDate);
      endDate.setHours(23, 59, 59, 999);
    }

    else if (period === "monthly") {
      startDate = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        1
      );

      endDate = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        0,
        23,
        59,
        59
      );
    }

    else {
      startDate = new Date(baseDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(baseDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // ================================
    // TASK PERFORMANCE (FILTERED BY DATE)
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
      {
        $match: {
          status: { $in: targetStatuses },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$budget" },
        },
      },
    ]);

    const totalTarget = targetResult[0]?.total || 0;

    // ================================
    // SALES ACHIEVED (DONE + CLOSED)
    // ================================
    const achievedStatuses = ["Done", "Closed"];

    const achievedResult = await Lead.aggregate([
      {
        $match: {
          status: { $in: achievedStatuses },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$budget" },
        },
      },
    ]);

    const totalAchieved = achievedResult[0]?.total || 0;

    // ================================
    // ACHIEVEMENT %
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

    if (period === "weekly") {
      const result = await Lead.aggregate([
        {
          $match: {
            status: { $in: graphStatuses },
            createdAt: { $gte: startDate, $lte: endDate },
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

    else if (period === "monthly") {
      const result = await Lead.aggregate([
        {
          $match: {
            status: { $in: graphStatuses },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            total: { $sum: "$budget" },
          },
        },
      ]);

      const totalDays = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        0
      ).getDate();

      salesGraphData = Array.from({ length: totalDays }, (_, i) => {
        const found = result.find((r) => r._id === i + 1);
        return {
          label: i + 1,
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