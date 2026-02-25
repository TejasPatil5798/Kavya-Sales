const Task = require("../models/Task");

// ADMIN – create task
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      taskDate: new Date(req.body.taskDate), // ✅ FORCE DATE
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ADMIN – all tasks
exports.getAllTasks = async (req, res) => {
  const tasks = await Task.find().sort({ dueDate: 1 });
  res.json(tasks);
};

// ADMIN – employee wise
exports.getTasksByEmployee = async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.params.employee });
  res.json(tasks);
};

// EMPLOYEE – own tasks
exports.getMyTasks = async (req, res) => {
  const { employee } = req.params;
  const tasks = await Task.find({ assignedTo: employee });
  res.json(tasks);
};
