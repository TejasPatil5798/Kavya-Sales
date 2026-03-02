import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api"; // ✅ ADDED
import "./ProjectIntake.css";

const ITEMS_PER_PAGE = 10;

const ProjectIntake = () => {
  const lineChartRef = useRef(null);
  const typeChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const barChartRef = useRef(null);

  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddProject, setShowAddProject] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState("");
  const [employees, setEmployees] = useState([]);

  // ✅ ADD PROJECT STATE
  const [newProject, setNewProject] = useState({
    clientName: "",
    clientCompany: "",
    email: "",
    mobile: "",
    projectName: "",
    reference: "", // ✅ ADD THIS
    budget: "",
    followUpDate: "",
    remarks: "",
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFollowUpFilter("");
    setCurrentPage(1);
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get("/users/all");

      const onlyEmployees = data.filter((user) => user.role === "employee");

      setEmployees(onlyEmployees);
    } catch (err) {
      console.error("Failed to fetch employees", err);
      setEmployees([]);
    }
  };

  /* ================= FETCH LEADS ================= */
  const fetchLeads = async () => {
    try {
      const { data } = await API.get("/leads");
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchEmployees();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, followUpFilter]);

  /* ================= FILTER LEAD → PROJECT ================= */
  const projects = leads.filter((l) => {
    if (l.status !== "Follow Up") return false;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      l.clientName?.toLowerCase().includes(search) ||
      l.clientCompany?.toLowerCase().includes(search) ||
      l.email?.toLowerCase().includes(search) ||
      l.mobile?.includes(search) ||
      l.projectName?.toLowerCase().includes(search);

    const matchesDate = followUpFilter
      ? l.followUpDate?.slice(0, 10) === followUpFilter
      : true;

    return matchesSearch && matchesDate;
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = projects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);

  /* ================= VALIDATION ================= */
  const validateProject = (project) => {
    const e = {};

    // 1️⃣ Client Name (only letters, min 5 chars)
    if (!project.clientName?.trim()) {
      e.clientName = "Client name is required";
    } else if (!/^[A-Za-z\s]+$/.test(project.clientName)) {
      e.clientName = "Only characters allowed";
    } else if (project.clientName.trim().length < 5) {
      e.clientName = "Minimum 5 characters required";
    }

    // 2️⃣ Client Company (only letters, min 3 chars)
    if (!project.clientCompany?.trim()) {
      e.clientCompany = "Company name is required";
    } else if (!/^[A-Za-z\s]+$/.test(project.clientCompany)) {
      e.clientCompany = "Only characters allowed";
    } else if (project.clientCompany.trim().length < 3) {
      e.clientCompany = "Minimum 3 characters required";
    }

    // 3️⃣ Email validation
    if (!project.email?.trim()) {
      e.email = "Email is required";
    }
    // Must match company domain
    else if (!/^[A-Za-z0-9]+@kavyainfoweb\.com$/.test(project.email)) {
      e.email = "Email must contain @kavyainfoweb.com";
    }
    // Must exist in registered users (leads list)
    else {
      const emailExists = employees.some(
        (emp) =>
          emp.email?.toLowerCase() === project.email.toLowerCase() &&
          emp.isActive === true,
      );

      if (!emailExists) {
        e.email = "Only registered users allowed";
      }
    }

    // 4️⃣ Mobile (exact 10 digits)
    if (!project.mobile?.trim()) {
      e.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(project.mobile)) {
      e.mobile = "Mobile must be exactly 10 digits";
    }

    // 5️⃣ Project Name
    if (!project.projectName?.trim()) {
      e.projectName = "Project name is required";
    }

    // 6️⃣ Budget (numbers only)
    if (!project.budget?.toString().trim()) {
      e.budget = "Budget is required";
    } else if (!/^[0-9]+$/.test(project.budget)) {
      e.budget = "Budget must contain only numbers";
    }

    // 7️⃣ Follow Up Date
    if (!project.followUpDate) {
      e.followUpDate = "Follow up date is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================= ADD PROJECT ================= */
  const handleAddProject = async () => {
    if (!validateProject(newProject)) return;

    try {
      const payload = {
        clientName: newProject.clientName,
        clientCompany: newProject.clientCompany,
        email: newProject.email,
        mobile: newProject.mobile,
        projectName: newProject.projectName,
        reference: newProject.reference,
        budget: newProject.budget,
        remarks: newProject.remarks,
        followUpDate: newProject.followUpDate,
      };

      await API.post("/leads", payload);

      setNewProject({
        clientName: "",
        clientCompany: "",
        email: "",
        mobile: "",
        projectName: "",
        reference: "",
        budget: "",
        followUpDate: "",
        remarks: "",
      });

      setShowAddProject(false);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add project");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await API.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!validateProject(editProject)) return;

    try {
      const payload = {
        clientName: editProject.clientName,
        clientCompany: editProject.clientCompany,
        email: editProject.email,
        mobile: editProject.mobile,
        projectName: editProject.projectName,
        reference: editProject.reference,
        budget: editProject.budget,
        remarks: editProject.remarks,
        followUpDate: editProject.followUpDate,
      };

      await API.put(`/leads/${editProject._id}`, payload);

      setShowEditModal(false);
      fetchLeads();
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="intake-page">
      {/* KPI */}
      <div className="intake-cards">
        <div className="kpi-card glass-card gradient-blue ">
          <small>Total Projects</small>
          <h3>{projects.length}</h3>
        </div>
        <div className="kpi-card glass-card gradient-teal">
          <small>Follow up</small>
          <h3>{projects.length}</h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="filter-card">
        <div
          className="table-header"
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <h3 style={{ marginRight: "20px" }}>Follow Up List</h3>

          {/* 🔍 SEARCH */}
          <input
            type="text"
            placeholder="Search client, company, email, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "6px", borderRadius: "6px", width: "220px", margin: "0", border: "1px solid rgb(204, 204, 204)" }}
          />

          {/* 📅 FOLLOW UP DATE FILTER */}
          <input
            type="date"
            value={followUpFilter}
            onChange={(e) => setFollowUpFilter(e.target.value)}
            style={{ padding: "6px", margin: "0" }}
          />

          {/* ✅ CLEAR FILTER BUTTON */}
          {(searchTerm.trim() !== "" || followUpFilter !== "") && (
            <button
              className="clear-filter-btn"
              onClick={clearFilters}
              title="Clear Filters"
            >
              ✕
            </button>
          )}

          {/* ➕ ADD BUTTON */}
          <button
            className="add-btn"
            onClick={() => setShowAddProject(true)}
            style={{ marginLeft: "auto" }}
          >
            + Add Project
          </button>
        </div>

        <div className="table-scroll">
          <table className="leads-table">
            <thead style={{ color: "white" }}>
              <tr>
                <th>Client</th>
                <th>Company</th>
                <th>User Email</th>
                <th>Mobile</th>
                <th>Project Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.map((p) => (
                <tr key={p._id}>
                  <td>{p.clientName}</td>
                  <td>{p.clientCompany}</td>
                  <td>{p.email}</td>
                  <td>{p.mobile}</td>
                  <td>{p.projectName}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setSelectedProject(p);
                        setShowViewModal(true);
                      }}
                    >
                      More
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditProject({
                          ...p,
                          startDate: p.timeline?.startDate?.slice(0, 10) || "",
                          endDate: p.timeline?.endDate?.slice(0, 10) || "",
                        });

                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* PAGINATION */}
        <div className="pagination">
          {/* Previous */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            ◀ Prev
          </button>

          {/* Page Numbers */}
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

          {/* Next */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next ▶
          </button>

          {/* Page Info */}
          <span className="page-info">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>

      {/* ================= ADD PROJECT MODAL ================= */}
      {showAddProject && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Project</h3>

            <input
              placeholder="Client Name"
              maxLength={50}
              value={newProject.clientName}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  clientName: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                })
              }
            />
            {errors.clientName && (
              <small className="error">{errors.clientName}</small>
            )}

            <input
              placeholder="Company Name"
              value={newProject.clientCompany}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  clientCompany: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                })
              }
            />
            {errors.clientCompany && (
              <small className="error">{errors.clientCompany}</small>
            )}

            <input
              placeholder="Email"
              value={newProject.email}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  email: e.target.value.replace(/[^A-Za-z0-9@.]/g, ""),
                })
              }
            />
            {errors.email && <small className="error">{errors.email}</small>}

            <input
              placeholder="Mobile"
              value={newProject.mobile}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
            />
            {errors.mobile && <small className="error">{errors.mobile}</small>}

            <input
              placeholder="Project Name"
              value={newProject.projectName}
              onChange={(e) =>
                setNewProject({ ...newProject, projectName: e.target.value })
              }
            />

            <input
              placeholder="Reference"
              value={newProject.reference}
              onChange={(e) =>
                setNewProject({ ...newProject, reference: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Budget"
              value={newProject.budget}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  budget: e.target.value.replace(/\D/g, ""),
                })
              }
            />
            {errors.budget && <small className="error">{errors.budget}</small>}

            <label>Follow Up Date</label>
            <input
              type="date"
              value={newProject.followUpDate}
              onChange={(e) =>
                setNewProject({ ...newProject, followUpDate: e.target.value })
              }
            />
            {errors.followUpDate && (
              <small className="error">{errors.followUpDate}</small>
            )}

            <div className="modal-actions">
              <button className="apply" onClick={handleAddProject}>
                Save Project
              </button>
              <button
                className="reset"
                onClick={() => setShowAddProject(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL (MORE DETAILS) */}
      {showViewModal && selectedProject && (
        <div className="modal-backdrop">
          <div className="modal small">
            <h3>Project Details</h3>

            <p>
              <b>Follow Up Date:</b>{" "}
              {selectedProject.followUpDate
                ? new Date(selectedProject.followUpDate).toLocaleDateString()
                : "-"}
            </p>

            <p>
              <b>Reference:</b> {selectedProject.reference || "-"}
            </p>

            <p>
              <b>Budget:</b> {selectedProject.budget || "-"}
            </p>

            <button className="reset" onClick={() => setShowViewModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editProject && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Edit Project</h3>

            <input
              placeholder="Client Name"
              maxLength={50}
              value={editProject.clientName || ""}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  clientName: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                })
              }
            />
            {errors.clientName && (
              <small className="error">{errors.clientName}</small>
            )}

            <input
              placeholder="Company"
              maxLength={50}
              value={editProject.clientCompany || ""}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  clientCompany: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                })
              }
            />
            {errors.clientCompany && (
              <small className="error">{errors.clientCompany}</small>
            )}

            <input
              placeholder="Email"
              value={editProject.email || ""}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  email: e.target.value.replace(/[^A-Za-z0-9@.]/g, ""),
                })
              }
            />
            {errors.email && <small className="error">{errors.email}</small>}

            <input
              placeholder="Mobile"
              maxLength={10}
              value={editProject.mobile || ""}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
            />
            {errors.mobile && <small className="error">{errors.mobile}</small>}

            <input
              placeholder="Project Name"
              value={editProject.projectName || ""}
              onChange={(e) =>
                setEditProject({ ...editProject, projectName: e.target.value })
              }
            />

            <input
              placeholder="Reference"
              value={editProject.reference || ""}
              onChange={(e) =>
                setEditProject({ ...editProject, reference: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Budget"
              value={editProject.budget || ""}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  budget: e.target.value.replace(/\D/g, ""),
                })
              }
            />
            {errors.budget && <small className="error">{errors.budget}</small>}

            <label>Follow Up Date</label>
            <input
              type="date"
              value={
                editProject.followUpDate
                  ? editProject.followUpDate.slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  followUpDate: e.target.value,
                })
              }
            />
            {errors.followUpDate && (
              <small className="error">{errors.followUpDate}</small>
            )}

            <div className="buttons">
              <button className="apply" onClick={handleUpdate}>
                Update
              </button>
              <button className="reset" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectIntake;
