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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [dateFilter, setDateFilter] = useState("");

  const ITEMS_PER_PAGE = 10;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDateFilter("");
    setCurrentPage(1);
  };

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

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.email) return;
      const userTasks = res.data.filter((task) => task.userMail === user.email);

      setTasks(userTasks);
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
    } catch (err) {
      alert("Only Admin can delete tasks.");
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
    new Date(task.taskDate) < new Date() && task.status !== "Completed";

  /* ================= SEARCH + FILTER ================= */
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      new Date(task.taskDate).toISOString().split("T")[0] === dateFilter;

    const text = `
    ${task.client || ""}
    ${task.userMail || ""}
    ${task.taskType || ""}
    ${task.note || ""}
  `.toLowerCase();

    const matchesSearch = text.includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch && matchesDate;
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  /* COUNTS */
  const totalTasks = filteredTasks.length;
  const pendingTasks = filteredTasks.filter(
    (t) => t.status === "Pending",
  ).length;
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "In Progress",
  ).length;
  const completedTasks = filteredTasks.filter(
    (t) => t.status === "Completed",
  ).length;

  if (loading) return <p style={{ padding: 20 }}>Loading tasks...</p>;

  return (
    <div className="my-tasks">
      {/* CARDS */}
      <div className="task-cards">
        <div className="kpi-card glass-card gradient-purple">
          <p style={{ fontSize: "14px" }}>Total Tasks</p>
          <h3>{totalTasks}</h3>
        </div>
        <div className="kpi-card glass-card gradient-pink">
          <p style={{ fontSize: "14px" }}>Pending</p>
          <h3>{pendingTasks}</h3>
        </div>
        <div className="kpi-card glass-card gradient-teal">
          <p style={{ fontSize: "14px" }}>In Progress</p>
          <h3>{inProgressTasks}</h3>
        </div>
        <div className="kpi-card glass-card gradient-orange">
          <p style={{ fontSize: "14px" }}>Completed</p>
          <h3>{completedTasks}</h3>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search client, type, mail..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              minWidth: "220px",
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          {/* ✅ CLEAR FILTER BUTTON */}
          {(searchTerm.trim() !== "" ||
            statusFilter !== "All" ||
            dateFilter !== "") && (
            <button
              className="clear-filter-btn"
              onClick={clearFilters}
              title="Clear Filters"
            >
              ✕
            </button>
          )}
        </div>

        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Create Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <p>No tasks assigned to you.</p>
      ) : (
        <div className="table-wrapper">
          <table className="tasks-table">
            <thead className="task-head">
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
              {paginatedTasks.map((task) => (
                <tr key={task._id} className={isOverdue(task) ? "overdue" : ""}>
                  <td>{task.client}</td>
                  <td>{task.userMail}</td>
                  <td>{task.taskType}</td>
                  <td>
                    {task.taskDate
                      ? new Date(task.taskDate).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td>{task.note || "-"}</td>
                  <td>
                    <select
                      className="status-select"
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(task._id)}
                      style={{ marginLeft: 6 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              ◀ Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next ▶
            </button>

            <span style={{ marginLeft: "10px" }}>
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>
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
              {errors.client && (
                <small style={{ color: "red" }}>{errors.client}</small>
              )}

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
                <small style={{ color: "red" }}>{errors.taskType}</small>
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
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              />

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  {isEdit ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                >
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
