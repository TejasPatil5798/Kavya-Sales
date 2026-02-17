import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
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


  // ✅ ADD PROJECT STATE
  const [newProject, setNewProject] = useState({
    clientName: "",
    clientCompany: "",
    email: "",
    mobile: "",
    projectType: "",
    reference: "",   // ✅ ADD THIS
    budget: "",
    followUpDate: "",
    remarks: "",
  });



  /* ================= FETCH LEADS ================= */
  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  /* ================= FILTER LEAD → PROJECT ================= */
  const projects = leads.filter(
    (l) => l.status === "Follow Up"
  );



  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = projects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);


  /* ================= VALIDATION ================= */
  const validateProject = (project) => {
    const e = {};

    // 1️⃣ Client Name (only characters)
    if (!project.clientName?.trim()) {
      e.clientName = "Client name is required";
    } else if (!/^[A-Za-z\s]+$/.test(project.clientName)) {
      e.clientName = "Only characters allowed";
    }

    // 2️⃣ Client Company (only characters)
    if (!project.clientCompany?.trim()) {
      e.clientCompany = "Company name is required";
    } else if (!/^[A-Za-z\s]+$/.test(project.clientCompany)) {
      e.clientCompany = "Only characters allowed";
    }

    // 3️⃣ Email
    if (!project.email?.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(project.email)) {
      e.email = "Invalid email format";
    }

    // 4️⃣ Mobile (exact 10 digits)
    if (!project.mobile?.trim()) {
      e.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(project.mobile)) {
      e.mobile = "Mobile must be exactly 10 digits";
    }

    // 5️⃣ Project Type
    if (!project.projectType?.trim()) {
      e.projectType = "Project type is required";
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
      const token = localStorage.getItem("authToken");

      const payload = {
        clientName: newProject.clientName,
        clientCompany: newProject.clientCompany,
        email: newProject.email,
        mobile: newProject.mobile,
        projectType: newProject.projectType,
        reference: newProject.reference,
        budget: newProject.budget,
        remarks: newProject.remarks,
        followUpDate: newProject.followUpDate,
      };


      const res = await fetch("http://localhost:5000/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Add project failed");

      // Reset + close
      setNewProject({
        clientName: "",
        clientCompany: "",
        email: "",
        mobile: "",
        projectType: "",
        reference: "",   // ✅ RESET IT
        budget: "",
        followUpDate: "",
        remarks: "",
      });



      setShowAddProject(false);
      fetchLeads(); // 🔥 refresh table
    } catch (err) {
      alert(err.message || "Failed to add project");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await fetch(`http://localhost:5000/api/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads();
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!validateProject(editProject)) return;

    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        clientName: editProject.clientName,
        clientCompany: editProject.clientCompany,
        email: editProject.email,
        mobile: editProject.mobile,
        projectType: editProject.projectType,
        reference: editProject.reference, // ✅ IMPORTANT
        budget: editProject.budget,
        remarks: editProject.remarks,
        followUpDate: editProject.followUpDate,
      };

      await fetch(`http://localhost:5000/api/leads/${editProject._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

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
        <div className="intake-card purple">
          <small>Total Projects</small>
          <h3>{projects.length}</h3>
        </div>
        <div className="intake-card pink">
          <small>Follow up</small>
          <h3>{projects.length}</h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="filter-card">
        <div className="table-header">
          <h3>Follow Up List</h3>
          <button className="add-btn" onClick={() => setShowAddProject(true)}>
            + Add Project
          </button>
        </div>
        <div className="table-scroll">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Company</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Project</th>
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
                  <td>{p.projectType}</td>
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
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
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
              value={newProject.clientName}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  clientName: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                })
              }
            />
            {errors.clientName && <small className="error">{errors.clientName}</small>}

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
            {errors.clientCompany && <small className="error">{errors.clientCompany}</small>}

            <input
              placeholder="Email"
              value={newProject.email}
              onChange={(e) =>
                setNewProject({ ...newProject, email: e.target.value })
              }
            />
            {errors.email && <small className="error">{errors.email}</small>}

            <input
              placeholder="Mobile"
              value={newProject.mobile}
              onChange={(e) =>
                setNewProject({
                  ...newProject, mobile: e.target.value.replace(/\D/g, "").slice(0, 10)
                })
              }
            />
            {errors.mobile && <small className="error">{errors.mobile}</small>}

            <input
              placeholder="Project Type"
              value={newProject.projectType}
              onChange={(e) =>
                setNewProject({ ...newProject, projectType: e.target.value })
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
                  ...newProject, budget: e.target.value.replace(/\D/g, "")
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
              value={editProject.clientName || ""}
              onChange={(e) =>
                setEditProject({ ...editProject, clientName: e.target.value })
              }
            />

            <input
              placeholder="Company"
              value={editProject.clientCompany || ""}
              onChange={(e) =>
                setEditProject({ ...editProject, clientCompany: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={editProject.email || ""}
              onChange={(e) =>
                setEditProject({ ...editProject, email: e.target.value })
              }
            />

            <input
              placeholder="Mobile"
              value={editProject.mobile || ""}
              onChange={(e) =>
                setEditProject({ ...editProject, mobile: e.target.value })
              }
            />

            <input
              placeholder="Project Type"
              value={editProject.projectType || ""}
              onChange={(e) =>
                setEditProject({ ...editProject, projectType: e.target.value })
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
              type="number"
              placeholder="Budget"
              value={editProject.budget || ""}
              onChange={(e) =>
                setEditProject({ ...editProject, budget: e.target.value })
              }
            />

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


            <div className="buttons">
              <button className="apply" onClick={handleUpdate}>
                Update
              </button>
              <button
                className="reset"
                onClick={() => setShowEditModal(false)}
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

export default ProjectIntake;
