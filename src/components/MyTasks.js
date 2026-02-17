import { useEffect, useState } from "react";
import API from "../api/api";
import "./MyTasks.css";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* MODAL STATE */
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  const [formData, setFormData] = useState({
    client: "",
    userMail: "",
    taskType: "",
    taskDate: "",
    note: "",
    priority: "Medium",
    status: "Pending",
  });

  const [errors, setErrors] = useState({});

  /* ================= FETCH TASKS ================= */
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    // ✅ Client validation
    if (!formData.client.trim()) {
      newErrors.client = "Client name is required";
    } else if (!nameRegex.test(formData.client.trim())) {
      newErrors.client = "Client should contain only alphabets.";
    }

    // ✅ Task Type validation
    if (!formData.taskType.trim()) {
      newErrors.taskType = "Task Type is required";
    } else if (!nameRegex.test(formData.taskType.trim())) {
      newErrors.taskType = "Task Type should contain only alphabets.";
    }

    // ✅ Date validation
    if (!formData.taskDate) {
      newErrors.taskDate = "Task date is required";
    } else {
      const selected = new Date(formData.taskDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        newErrors.taskDate = "Task date cannot be in the past.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // 🔥 ADD THIS

    try {
      await API.post("/tasks", formData);
      closeModal();
      fetchTasks();
    } catch {
      alert("Failed to create task");
    }
  };


  /* ================= UPDATE TASK ================= */
  const handleUpdateTask = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // 🔥 ADD THIS

    try {
      await API.put(`/tasks/${editTaskId}`, formData);
      closeModal();
      fetchTasks();
    } catch {
      alert("Failed to update task");
    }
  };


  /* ================= STATUS UPDATE ================= */
  const updateStatus = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };



  /* ================= EDIT ================= */
  const handleEdit = (task) => {
    setIsEdit(true);
    setEditTaskId(task._id);
    setFormData({
      client: task.client,
      userMail: task.userMail,
      taskType: task.taskType,
      taskDate: task.taskDate,
      note: task.note,
      priority: task.priority || "Medium",
      status: task.status,
    });
    setShowModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch {
      alert("Failed to delete task");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditTaskId(null);
    setFormData({
      client: "",
      userMail: "",
      taskType: "",
      taskDate: "",
      note: "",
      priority: "Medium",
      status: "Pending",
    });
  };

  const isOverdue = (task) =>
    new Date(task.taskDate) < new Date() &&
    task.status !== "Completed";

  if (loading) return <p style={{ padding: 20 }}>Loading tasks...</p>;

  /* COUNTS */
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;

  return (
    <div className="my-tasks">
      <h2>My Tasks</h2>

      {/* CARDS */}
      <div className="task-cards">
        <div className="task-card total"><p>Total Tasks</p><h3>{totalTasks}</h3></div>
        <div className="task-card pending"><p>Pending</p><h3>{pendingTasks}</h3></div>
        <div className="task-card progress"><p>In Progress</p><h3>{inProgressTasks}</h3></div>
        <div className="task-card completed"><p>Completed</p><h3>{completedTasks}</h3></div>
      </div>

      {/* CREATE TASK BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          + Create Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <p>No tasks assigned to you.</p>
      ) : (
        <div className="table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>User Mail</th>
                <th>Task Type</th>
                <th>Task Date</th>
                <th>Note</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id} className={isOverdue(task) ? "overdue" : ""}>
                  <td>{task.client}</td>
                  <td>{task.userMail}</td>
                  <td>{task.taskType}</td>
                  <td>{task.taskDate}</td>
                  <td>{task.note || "-"}</td>
                  <td>
                    <select
                      className="status-select"
                      value={task.status}
                      onChange={e => updateStatus(task._id, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(task)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(task._id)} style={{ marginLeft: 6 }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ display: "block" }}>
            <h3>{isEdit ? "Edit Task" : "Create Task"}</h3>

            <form onSubmit={isEdit ? handleUpdateTask : handleCreateTask}>
              <input
                placeholder="Client"
                required
                value={formData.client}
                onChange={(e) => {
                  const value = e.target.value;

                  // 🔥 Allow only letters and spaces
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    setFormData({ ...formData, client: value });
                  }
                }}
              />
              {errors.client && <small style={{ color: "red" }}>{errors.client}</small>}

              <input
                placeholder="Task Type"
                value={formData.taskType}
                onChange={(e) => {
                  setFormData({ ...formData, taskType: e.target.value });
                  setErrors({ ...errors, taskType: "" });
                }}
                className={errors.taskType ? "error" : ""}
              />
              {errors.taskType && (
                <small style={{ color: "red" }}>
                  {errors.taskType}
                </small>
              )}


              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]} // 🔥 Prevent past
                value={formData.taskDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taskDate: e.target.value,
                  })
                }
              />
              {errors.taskDate && (
                <small style={{ color: "red" }}>{errors.taskDate}</small>
              )}


              <textarea
                placeholder="Note"
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
              />

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  {isEdit ? "Update" : "Create"}
                </button>
                <button type="button" className="secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
