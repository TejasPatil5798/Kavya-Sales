const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET Dashboard Summary
router.get("/summary", async (req, res) => {
  try {
    const { period = "weekly" } = req.query;

    const now = new Date();
    let startDate = new Date();

    // FILTER BASED ON PERIOD
    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      startDate.setMonth(now.getMonth() - 1);
    }

    // GET COMPLETED TASKS
    const completedTasks = await Task.find({
      status: "Completed",
      taskDate: { $gte: startDate },
    });

    // GROUP BY USER MAIL
    const performanceMap = {};

    completedTasks.forEach((task) => {
      if (!performanceMap[task.userMail]) {
        performanceMap[task.userMail] = 0;
      }
      performanceMap[task.userMail]++;
    });

    // CONVERT TO ARRAY
    let topPerformers = Object.keys(performanceMap).map((email) => ({
      name: email,
      achievement: performanceMap[email],
    }));

    // SORT DESC
    topPerformers.sort((a, b) => b.achievement - a.achievement);

    // TAKE TOP 10
    topPerformers = topPerformers.slice(0, 10);

    res.json({
      topPerformers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;