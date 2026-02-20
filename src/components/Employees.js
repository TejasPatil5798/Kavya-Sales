import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import API from "../api/api"; // adjust path if needed
import "./Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [filters, setFilters] = useState({
    role: "",
    status: "",
    team: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [errors, setErrors] = useState({}); // ✅ NEW

  const COMPANY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@kavyainfoweb\.com$/;

  const [showResetModal, setShowResetModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEmployees = employees.length;
  const totalAdmins = employees.filter((e) => e.role === "admin").length;
  const totalUsers = employees.filter((e) => e.role === "employee").length;

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [filters, employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get("/users/all");
      setEmployees(data);
      setFiltered(data);
    } catch {
      alert("Failed to load employees");
    }
  };
  const applyFilters = () => {
    let data = [...employees];

    // ✅ ROLE FILTER
    if (filters.role) {
      data = data.filter((e) => e.role === filters.role);
    }

    // ✅ STATUS FILTER
    if (filters.status) {
      data = data.filter((e) =>
        filters.status === "active" ? e.isActive : !e.isActive
      );
    }

    // ✅ TEAM FILTER
    if (filters.team) {
      data = data.filter((e) => e.team === filters.team);
    }

    // ✅ SEARCH FILTER (NEW)
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (e) =>
          e.name?.toLowerCase().includes(lower) ||
          e.email?.toLowerCase().includes(lower) ||
          e.phone?.includes(lower)
      );
    }

    setFiltered(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/users/${id}`);
      setEmployees(employees.filter((e) => e._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const handleRoleChange = (role) => {
    setErrors({}); // ✅ clear errors on role change

    if (role === "admin") {
      setEditingUser({
        ...editingUser,
        role: "admin",
        team: "",
        monthlyCallTarget: null,
        monthlySalesTarget: null,
      });
    } else {
      setEditingUser({
        ...editingUser,
        role: "employee",
        team: editingUser.team || "",
      });
    }
  };

  /* ================= VALIDATION ================= */
  const validateEdit = () => {
    const e = {};

    if (!editingUser.name || !editingUser.name.trim()) {
      e.name = "Name is required";
    }

    if (!editingUser.email || !editingUser.email.trim()) {
      e.email = "Email is required";
    } else if (!COMPANY_EMAIL_REGEX.test(editingUser.email)) {
      e.email = "Email must be a valid @kavyainfoweb.com address";
    }

    // ✅ PHONE VALIDATION
    if (editingUser.phone && !/^[0-9]{10}$/.test(editingUser.phone)) {
      e.phone = "Mobile number must be 10 digits";
    }

    if (editingUser.role === "employee" && !editingUser.team) {
      e.team = "Team is required for employee";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateEdit()) return;

    try {
      const payload = {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        team:
          editingUser.role === "employee" ? editingUser.team : "",
        monthlyCallTarget:
          editingUser.role === "employee"
            ? editingUser.monthlyCallTarget
            : null,
        monthlySalesTarget:
          editingUser.role === "employee"
            ? editingUser.monthlySalesTarget
            : null,
        isActive: editingUser.isActive,
      };

      const { data } = await API.put(`/users/${editingUser._id}`, payload);

      setEmployees(
        employees.map((u) => (u._id === data.user._id ? data.user : u)),
      );

      setEditingUser(null);
      setErrors({});
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser?._id) return;

    if (!window.confirm("Are you sure you want to reset this user's password?"))
      return;

    try {
      await API.post(`/users/reset-password/${editingUser._id}`);

      alert("Password reset successfully!\nNew Password: Welcome@123");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const submitResetPassword = async () => {
    if (!passwordData.password || !passwordData.confirmPassword) {
      setPasswordError("Both fields are required");
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await API.post(`/users/reset-password/${editingUser._id}`, {
        password: passwordData.password,
      });

      alert("Password updated successfully");
      setShowResetModal(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Something went wrong");
    }
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedEmployees = filtered.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="employees-page fade-in">
      <h2>Employees</h2>


      {/* DASHBOARD CARDS */}
      <div className="employee-cards">
        <div className="emp-card blue">
          <h4>Total Employees</h4>
          <h2>{totalEmployees}</h2>
        </div>

        <div className="emp-card purple">
          <h4>Total Admins</h4>
          <h2>{totalAdmins}</h2>
        </div>

        <div className="emp-card green">
          <h4>Total Users</h4>
          <h2>{totalUsers}</h2>
        </div>
      </div>
      {/* SEARCH BAR */}
      <div className="top-controls">
        <div className="employee-search">
          <input
            type="text"
            placeholder="Search by Name, Email or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTER BAR */}
        <div className="filter-bar">
          <select
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>

          <select
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            onChange={(e) => setFilters({ ...filters, team: e.target.value })}
          >
            <option value="">All Teams</option>
            <option>Team A</option>
            <option>Team B</option>
            <option>Team C</option>
          </select>
        </div>

      </div>

      {/* TABLE */}
      <div className="table-scroll">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Team</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.phone || "-"}</td>
                <td>{emp.role}</td>
                <td>{emp.team || "-"}</td>
                <td>{emp.isActive ? "Active" : "Inactive"}</td>
                <td className="actions">
                  <button
                    onClick={() => {
                      setEditingUser(emp);
                      setErrors({});
                    }}
                    className="edit-btn"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="delete-btn"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <div className="close-button">
                <FiX onClick={() => setEditingUser(null)} />
              </div>
            </div>

            <input
              required
              value={editingUser.name}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                setEditingUser({ ...editingUser, name: value });
              }}
              placeholder="Name"
              className={errors.name ? "error" : ""}
            />
            {errors.name && <small className="error-text">{errors.name}</small>}

            <input
              type="email"
              value={editingUser.email}
              onChange={(e) => {
                const value = e.target.value;

                setEditingUser({ ...editingUser, email: value });

                // 🔥 LIVE EMAIL VALIDATION
                if (!COMPANY_EMAIL_REGEX.test(value)) {
                  setErrors({
                    ...errors,
                    email: "Email must end with @kavyainfoweb.com",
                  });
                } else {
                  setErrors({ ...errors, email: "" });
                }
              }}
              placeholder="Email"
            />

            {errors.email && (
              <small className="error-text">{errors.email}</small>
            )}

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={editingUser.phone || ""}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");

                setEditingUser({
                  ...editingUser,
                  phone: numericValue,
                });

                if (/^[0-9]{10}$/.test(numericValue)) {
                  setErrors({ ...errors, phone: "" });
                }
              }}
              placeholder="Mobile Number"
              className={errors.phone ? "error" : ""}
            />

            {errors.phone && (
              <small className="error-text">{errors.phone}</small>
            )}

            <select
              value={editingUser.role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>

            {editingUser.role === "employee" && (
              <>
                <select
                  value={editingUser.team}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, team: e.target.value })
                  }
                  className={errors.team ? "error" : ""}
                >
                  <option value="">Select Team</option>
                  <option>Team A</option>
                  <option>Team B</option>
                  <option>Team C</option>
                </select>
                {errors.team && (
                  <small className="error-text">{errors.team}</small>
                )}
              </>
            )}

            <input
              type="number"
              placeholder="Monthly Call Target"
              value={editingUser.monthlyCallTarget || ""}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  monthlyCallTarget: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Monthly Sales Target"
              value={editingUser.monthlySalesTarget || ""}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  monthlySalesTarget: e.target.value,
                })
              }
            />


            <select
              value={editingUser.isActive}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  isActive: e.target.value === "true",
                })
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <div className="modal-actions">
              <button onClick={handleUpdate} className="save-btn">
                Save
              </button>

              <button
                onClick={() => {
                  setShowResetModal(true);
                  setPasswordData({ password: "", confirmPassword: "" });
                  setPasswordError("");
                }}
                className="reset-btn"
              >
                Reset Password
              </button>

              <button
                onClick={() => setEditingUser(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>

            {/* <div className="modal-actions">
                            <button onClick={handleUpdate} className="save-btn">
                                Save
                            </button>
                            <button onClick={() => setEditingUser(null)} className="cancel-btn">
                                Cancel
                            </button>
                        </div> */}
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Reset Password</h3>
            </div>

            <div className="close-button">
              <FiX onClick={() => setShowResetModal(false)} />
            </div>

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, password: e.target.value })
                }
              />
              <span
                className="emp-eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
              <span
                className="emp-eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {passwordError && (
              <small className="error-text">{passwordError}</small>
            )}

            <div className="modal-actions">
              <button onClick={submitResetPassword} className="save-btn">
                Update Password
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
