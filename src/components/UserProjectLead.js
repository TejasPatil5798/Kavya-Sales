import { useEffect, useState } from "react";
import API from "../api/api"; // ✅ ADD THIS
import "./ProjectLead.css";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  "Follow Up",
  "Interested",
  "Not Interested",
  "Open",
  "Closed",
  "Pending",
  "Done",
];

const UserProjectLead = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editLeadId, setEditLeadId] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [leadForm, setLeadForm] = useState({
    clientName: "",
    clientCompany: "",
    email: "",
    mobile: "",
    projectName: "",
    status: "Follow Up",
    followUpDate: "",
    timeline: {
      startDate: "",
      endDate: "",
    },
    budget: "",
    reference: "",
  });

  const todayDate = new Date().toISOString().split("T")[0];
  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= VALIDATION ================= */
  const validateLeadForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ✅ Client Name
    if (!leadForm.clientName.trim()) {
      newErrors.clientName = "Client Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(leadForm.clientName.trim())) {
      newErrors.clientName = "Client Name must contain only alphabets.";
    } else if (leadForm.clientName.trim().length < 5) {
      newErrors.clientName = "Client Name must be at least 5 characters long.";
    }

    // ✅ Client Company
    if (!leadForm.clientCompany.trim()) {
      newErrors.clientCompany = "Company Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(leadForm.clientCompany.trim())) {
      newErrors.clientCompany = "Company Name must contain only alphabets.";
    } else if (leadForm.clientCompany.trim().length < 4) {
      newErrors.clientCompany =
        "Company Name must be at least 4 characters long.";
    }

    // ✅ Email
    if (!leadForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(leadForm.email.trim())) {
      newErrors.email = "Enter valid email";
    }

    // ✅ Mobile
    if (!/^[0-9]{10}$/.test(leadForm.mobile)) {
      newErrors.mobile = "Mobile must be 10 digits";
    }

    // ✅ Project Name
    if (!leadForm.projectName.trim()) {
      newErrors.projectName = "Project Name is required";
    } else if (leadForm.projectName.trim().length < 3) {
      newErrors.projectName =
        "Project Name must be at least 3 characters long.";
    }

    // ✅ Budget (numeric only)
    if (leadForm.budget && !/^[0-9]+$/.test(leadForm.budget)) {
      newErrors.budget = "Budget must contain numbers only.";
    }

    // ✅ Follow Up
    if (leadForm.status === "Follow Up" && !leadForm.followUpDate) {
      newErrors.followUpDate = "Follow up date required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ================= FETCH USER ASSIGNED LEADS ================= */
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/leads/my-leads");
      setLeads(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  /* ================= SAVE (ADD / EDIT) ================= */
  const handleSaveLead = async () => {
    if (!validateLeadForm()) return;

    if (!user || !user.id) {
      alert("User not found. Please login again.");
      return;
    }

    try {
      if (editLeadId) {
        await API.put(`/leads/${editLeadId}`, leadForm);
      } else {
        await API.post("/leads", leadForm);
      }

      setShowAddLead(false);
      setEditLeadId(null);
      setErrors({});
      fetchLeads();
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Something went wrong");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (lead) => {
    setEditLeadId(lead._id);
    setLeadForm({
      clientName: lead.clientName || "",
      clientCompany: lead.clientCompany || "",
      email: user?.email || "",
      mobile: lead.mobile || "",
      projectName: lead.projectName || "",
      status: lead.status || "Follow Up",
      followUpDate: lead.followUpDate?.slice(0, 10) || "",
      timeline: {
        startDate: lead.timeline?.startDate?.slice(0, 10) || "",
        endDate: lead.timeline?.endDate?.slice(0, 10) || "",
      },
      budget: lead.budget || "",
      reference: lead.reference || "",
    });
    setShowAddLead(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;

    await API.delete(`/leads/${id}`);

    fetchLeads();
  };

  /* ================= SEARCH + FILTER ================= */
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.projectName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  /* 🔥 SAFETY FIX */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="projectlead-page">
      <style>
        {`
  /* PAGINATION */
  .pagination {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }

  .pagination button {
    padding: 6px 12px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;
    border-radius: 6px;
  }

  .pagination button.active {
    background: #6c5ce7;
    color: #fff;
    border-color: #6c5ce7;
  }

  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* RESPONSIVE TABLE */
  @media (max-width: 992px) {
    .filter-card {
      overflow-x: auto;
    }

    .leads-table {
      min-width: 900px;
    }
  }

  /* MOBILE (412px) */
  @media (max-width: 412px) {
    .pagination {
      justify-content: center;
    }
  }
`}
      </style>

      {/* 🔥 INTERNAL RESPONSIVE CSS */}
      <style>
        {`
      /* TABLE RESPONSIVE */
      @media (max-width: 992px) {
        .filter-card {
          overflow-x: auto;
        }

        .leads-table {
          min-width: 900px;
        }
      }

      /* MOBILE (412px) */
      @media (max-width: 412px) {
        .pl-cards {
          grid-template-columns: 1fr;
        }

        .leads-table th,
        .leads-table td {
          font-size: 12px;
          padding: 6px;
          white-space: nowrap;
        }

        .pagination {
          justify-content: center;
        }
      }
    `}
      </style>

      {/* rest of your JSX */}

      <div className="pl-cards">
        <div className="kpi-card glass-card gradient-purple">
          <h6>Total Leads</h6>
          <h3>{leads.length}</h3>
        </div>

        <div className="kpi-card glass-card gradient-pink">
          <h6>Total Deals</h6>
          <h3>—</h3>
        </div>

        <div className="kpi-card glass-card gradient-blue">
          <h6>Lead Conversion</h6>
          <h3>—</h3>
        </div>

        <div className="kpi-card glass-card gradient-green">
          <h6>Avg Deal</h6>
          <h3>—</h3>
        </div>
      </div>

      <div className="filter-card">
        <div
          className="header-div"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h3>Leads List</h3>
          <div
            className="filter-bar top-bar"
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Search by name, company, project..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "9px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                minWidth: "250px",
                margin: "0",
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "9px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                margin: "0",
              }}
            >
              <option value="All">All Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              className="add-lead-btn"
              onClick={() => {
                setEditLeadId(null);
                setLeadForm({
                  clientName: "",
                  clientCompany: "",
                  email: user?.email || "",
                  mobile: "",
                  projectName: "",
                  status: "Follow Up",
                  followUpDate: "",
                  timeline: { startDate: "", endDate: "" },
                  budget: "",
                  reference: "",
                });
                setShowAddLead(true);
              }}
            >
              + Add Lead
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="leads-table">
            <thead style={{color: "white"}}>
              <tr>
                <th>Client Name</th>
                <th>Company</th>
                <th> User Email</th>
                <th>Mobile</th>
                <th>Project Name</th>
                <th>Status</th>
                <th>More</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.clientName}</td>
                  <td>{lead.clientCompany}</td>
                  <td>{lead.email}</td>
                  <td>{lead.mobile}</td>
                  <td>{lead.projectName}</td>
                  <td>{lead.status}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowMoreModal(true);
                      }}
                    >
                      More
                    </button>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(lead)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      style={{ marginLeft: "6px" }}
                      onClick={() => handleDelete(lead._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length > 0 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL – FULL FORM */}
      {showAddLead && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editLeadId ? "Edit Lead" : "Add Lead"}</h3>
            <input
              placeholder="Client Name"
              value={leadForm.clientName}
              onChange={(e) => {
                const value = e.target.value;

                if (/^[A-Za-z\s]*$/.test(value)) {
                  setLeadForm({ ...leadForm, clientName: value });
                }

                setErrors({ ...errors, clientName: "" });
              }}
              className={errors.clientName ? "error" : ""}
            />
            {errors.clientName && (
              <small style={{ color: "red" }}>{errors.clientName}</small>
            )}

            <input
              placeholder="Client Company"
              value={leadForm.clientCompany}
              onChange={(e) => {
                const value = e.target.value;

                if (/^[A-Za-z\s]*$/.test(value)) {
                  setLeadForm({ ...leadForm, clientCompany: value });
                }

                setErrors({ ...errors, clientCompany: "" });
              }}
              className={errors.clientCompany ? "error" : ""}
            />
            {errors.clientCompany && (
              <small style={{ color: "red" }}>{errors.clientCompany}</small>
            )}

            <input
              placeholder="User Email"
              value={leadForm.email}
              disabled // ✅ makes it non-editable
              className="readonly-input"
            />
            {errors.email && (
              <small style={{ color: "red" }}>{errors.email}</small>
            )}
            <input
              placeholder="Mobile"
              maxLength={10}
              value={leadForm.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setLeadForm({ ...leadForm, mobile: value });
                setErrors({ ...errors, mobile: "" });
              }}
              className={errors.mobile ? "error" : ""}
            />
            {errors.mobile && (
              <small style={{ color: "red" }}>{errors.mobile}</small>
            )}

            <input
              placeholder="Project Name"
              value={leadForm.projectName}
              onChange={(e) =>
                setLeadForm({ ...leadForm, projectName: e.target.value })
              }
              className={errors.projectName ? "error" : ""}
            />
            {errors.projectName && (
              <small style={{ color: "red" }}>{errors.projectName}</small>
            )}

            <select
              value={leadForm.status}
              onChange={(e) => {
                const newStatus = e.target.value;

                setLeadForm({
                  ...leadForm,
                  status: newStatus,
                  followUpDate: "",
                  timeline: {
                    startDate: "",
                    endDate: "",
                  },
                });
              }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {leadForm.status === "Follow Up" && (
              <>
                <label>Follow Up Date</label>
                <input
                  type="date"
                  min={todayDate}
                  value={leadForm.followUpDate}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      followUpDate: e.target.value,
                    })
                  }
                />
                {errors.followUpDate && (
                  <small style={{ color: "red" }}>{errors.followUpDate}</small>
                )}
              </>
            )}

            {leadForm.status !== "Follow Up" && (
              <>
                <label>Start Date</label>
                <input
                  type="date"
                  min={todayDate}
                  value={leadForm.timeline.startDate}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      timeline: {
                        ...leadForm.timeline,
                        startDate: e.target.value,
                      },
                    })
                  }
                />

                <label>End Date</label>
                <input
                  type="date"
                  min={leadForm.timeline.startDate || todayDate}
                  value={leadForm.timeline.endDate}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      timeline: {
                        ...leadForm.timeline,
                        endDate: e.target.value,
                      },
                    })
                  }
                />
              </>
            )}

            <input
              placeholder="Budget"
              value={leadForm.budget}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setLeadForm({ ...leadForm, budget: value });
                setErrors({ ...errors, budget: "" });
              }}
            />

            {errors.budget && (
              <small style={{ color: "red" }}>{errors.budget}</small>
            )}

            <input
              placeholder="Reference"
              value={leadForm.reference}
              onChange={(e) =>
                setLeadForm({ ...leadForm, reference: e.target.value })
              }
            />

            <div className="filter-actions">
              <button type="button" className="apply" onClick={handleSaveLead}>
                Save
              </button>
              <button
                className="reset"
                onClick={() => {
                  setShowAddLead(false);
                  setEditLeadId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MORE MODAL */}
      {showMoreModal && selectedLead && (
        <div className="modal-backdrop">
          <div className="modal small">
            <h3>Lead Details</h3>
            {selectedLead.status === "Follow Up" ? (
              <p>
                <b>Follow Up Date:</b>{" "}
                {selectedLead.followUpDate
                  ? selectedLead.followUpDate.slice(0, 10)
                  : "-"}
              </p>
            ) : (
              <>
                <p>
                  <b>Start Date:</b>{" "}
                  {selectedLead.timeline?.startDate
                    ? selectedLead.timeline.startDate.slice(0, 10)
                    : "-"}
                </p>

                <p>
                  <b>End Date:</b>{" "}
                  {selectedLead.timeline?.endDate
                    ? selectedLead.timeline.endDate.slice(0, 10)
                    : "-"}
                </p>
              </>
            )}

            <p>
              <b>Budget:</b> {selectedLead.budget || "-"}
            </p>
            <p>
              <b>Reference:</b> {selectedLead.reference || "-"}
            </p>

            <button className="reset" onClick={() => setShowMoreModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProjectLead;
