const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

/* ================= GET TASKS ================= */
router.get("/", auth, async (req, res) => {
  console.log("Logged in email:", req.user.email);
  try {
    let tasks;

    if (req.user.role === "admin") {
      // Admin → see all tasks
      tasks = await Task.find().sort({ createdAt: -1 });
    } else {
      // User → see only own tasks
      tasks = await Task.find({
        userMail: req.user.email,
      }).sort({ createdAt: -1 });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= CREATE TASK ================= */
router.post("/", auth, async (req, res) => {
  try {
    let { userMail } = req.body;

    // 🔥 Normal user → force self assignment
    if (req.user.role !== "admin") {
      userMail = req.user.email;
    }

    // 🔥 Validate user exists
    const user = await User.findOne({
      email: userMail.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist with this email",
      });
    }

    const task = await Task.create({
      ...req.body,
      userMail: user.email,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

/* ================= FULL UPDATE TASK ================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔥 User can only edit own task
    if (
      req.user.role !== "admin" &&
      task.userMail !== req.user.email
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );


    res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});


/* ================= DELETE TASK ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔥 Only admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete tasks",
      });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
