import { useEffect, useState } from "react";
import "./Tasks.css";
import API from "../api/api";

const Tasks = () => {
  /* ================= STATE ================= */
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

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


  const role = localStorage.getItem("role");
  const loggedInUser = localStorage.getItem("email");

  /* ================= FETCH TASKS ================= */
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get("/tasks");
      setTasks(data);
    } catch {
      console.error("Failed to fetch tasks");
    }
  };

};

/* ================= FORM VALIDATION ================= */
const validateForm = () => {
  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let newErrors = {};

  // ✅ Client validation
  if (!formData.client.trim()) {
    newErrors.client = "Client name is required.";
  } else if (!nameRegex.test(formData.client.trim())) {
    newErrors.client = "Client name should contain only letters and spaces.";
  }

  // ✅ Email validation
  if (!formData.userMail.trim()) {
    newErrors.userMail = "Email is required.";
  } else if (!emailRegex.test(formData.userMail.trim())) {
    newErrors.userMail = "Please enter a valid email address.";
  }

  // ✅ Task Type validation (🔥 NEW)
  if (!formData.taskType.trim()) {
    newErrors.taskType = "Task Type is required.";
  } else if (!/^[A-Za-z\s]+$/.test(formData.taskType.trim())) {
    newErrors.taskType = "Task Type should contain only alphabets.";
  }

  // ✅ Date validation
  const selected = new Date(formData.taskDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected < today) {
    newErrors.taskDate = "Task date cannot be in the past.";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


/* ================= CREATE TASK ================= */
const handleCreateTask = async (e) => {
  e.preventDefault();

  if (!validateForm()) return; // 🔥 ADD THIS

  try {
    await API.post("/tasks", formData);

    alert("Task created successfully ✅");

    closeModal();
    fetchTasks();
  } catch (error) {
    alert(error.response?.data?.message || "Something went wrong");
  }

};

/* ================= UPDATE TASK ================= */
const handleUpdateTask = async (e) => {
  e.preventDefault();

  if (!validateForm()) return; // 🔥 ADD THIS

  try {
    await API.put(`/tasks/${editTaskId}`, formData);

    alert("Task updated successfully ✅");

    closeModal();
    fetchTasks();
  } catch (error) {
    alert(error.response?.data?.message || "Failed to update task");
  }
};

/* ================= DELETE TASK ================= */
const handleDeleteTask = async (id) => {
  if (!window.confirm("Are you sure you want to delete this task?")) return;

  try {
    await API.delete(`/tasks/${id}`);

    fetchTasks();
  } catch {
    alert("Failed to delete task");
  }
};

/* ================= EDIT CLICK ================= */
const handleEditClick = (task) => {
  setIsEdit(true);
  setEditTaskId(task._id);

  setFormData({
    client: task.client,
    userMail: task.userMail,
    taskType: task.taskType,
    taskDate: task.taskDate?.split("T")[0], // 🔥 FIX
    note: task.note,
    priority: task.priority || "Medium",
    status: task.status,
  });

  setShowModal(true);
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

/* ================= STATUS UPDATE ================= */
const updateStatus = async (taskId, status) => {
  try {
    await API.put(`/tasks/${taskId}`, { status });

    fetchTasks();
  } catch {
    alert("Failed to update status");
  }
};


/* ================= HELPERS ================= */
const isOverdue = (task) =>
  new Date(task.taskDate) < new Date() &&
  task.status !== "Completed";

const filteredTasks = tasks.filter((task) => {
  const employeeMatch =
    role !== "admin"
      ? task.userMail === loggedInUser
      : task.userMail
        ?.toLowerCase()
        .includes(employeeSearch.toLowerCase());

  const dateMatch = !selectedDate || task.taskDate === selectedDate;

  return employeeMatch && dateMatch;
});

const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const paginatedTasks = filteredTasks.slice(
  startIndex,
  startIndex + ITEMS_PER_PAGE
);

/* ================= KPI COUNTS ================= */
const totalTasks = filteredTasks.length;
const completedTasks = filteredTasks.filter(
  (t) => t.status === "Completed"
).length;
const inProgressTasks = filteredTasks.filter(
  (t) => t.status === "In Progress"
).length;
const pendingTasks = filteredTasks.filter(
  (t) => t.status === "Pending"
).length;

/* ================= UI ================= */
return (
  <div className="tasks-page">
    {/* HEADER */}
    <div className="page-header">
      <h2>Tasks Management</h2>
    </div>

    {/* KPI CARDS */}
    <div className="kpi-grid">
      <div className="kpi-card blue">
        <h4>Total</h4>
        <p>{totalTasks}</p>
      </div>
      <div className="kpi-card green">
        <h4>Completed</h4>
        <p>{completedTasks}</p>
      </div>
      <div className="kpi-card yellow">
        <h4>In Progress</h4>
        <p>{inProgressTasks}</p>
      </div>
      <div className="kpi-card red">
        <h4>Pending</h4>
        <p>{pendingTasks}</p>
      </div>
    </div>

    {/* FILTERS + CREATE TASK */}
    {role === "admin" && (
      <div className="filters filters-with-action">
        <div className="filters-left">
          <input
            type="text"
            placeholder="Search user mail..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          + Create Task
        </button>
      </div>
    )}

    {/* TABLE */}
    <div className="card">
      <div className="card-header">Task List</div>

      <div className="card-body table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>User Mail</th>
              <th>Task Type</th>
              <th>Task Date</th>
              <th>Note</th>
              <th>Status</th>
              {role === "admin" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map((task) => (
              <tr
                key={task._id}
                className={isOverdue(task) ? "overdue" : ""}
              >
                <td>{task.client}</td>
                <td>{task.userMail}</td>
                <td>{task.taskType}</td>
                <td>{task.taskDate}</td>
                <td className="note-cell">{task.note}</td>
                <td>
                  <select
                    className="status-select"
                    value={task.status}
                    onChange={(e) =>
                      updateStatus(task._id, e.target.value)
                    }
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </td>

                {role === "admin" && (
                  <td>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditClick(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              className={currentPage === page ? "active" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>

    {/* CREATE / EDIT MODAL */}
    {showModal && (
      <div className="modal-backdrop">
        <div className="modal">
          <h3>{isEdit ? "Edit Task" : "Create Task"}</h3>

          <form
            onSubmit={
              isEdit ? handleUpdateTask : handleCreateTask
            }
          >
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
              type="email"
              placeholder="User Mail"
              required
              value={formData.userMail}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userMail: e.target.value,
                })
              }
            />
            {errors.userMail && (
              <small style={{ color: "red" }}>{errors.userMail}</small>
            )}


            <input
              placeholder="Task Type"
              value={formData.taskType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taskType: e.target.value,
                })
              }
              className={errors.taskType ? "error" : ""}
            />

            {errors.taskType && (
              <small style={{ color: "red" }}>
                {errors.taskType}
              </small>
            )}


            <h6 style={{ margin: 0 }}>Task Date</h6>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={formData.taskDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taskDate: e.target.value,
                })
              }
            />


            <textarea
              placeholder="Note"
              value={formData.note}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  note: e.target.value,
                })
              }
            />

            {isEdit && (
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            )}

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

export default Tasks;
