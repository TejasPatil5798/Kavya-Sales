import { useEffect, useRef, useState } from "react";

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

const ProjectLead = () => {


  const [showFilter, setShowFilter] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [editLeadId, setEditLeadId] = useState(null);

  const [selectedLead, setSelectedLead] = useState(null);

  const [leadForm, setLeadForm] = useState({
    clientName: "",
    clientCompany: "",
    email: "",
    mobile: "",
    projectType: "",
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

  /* ================= VALIDATION (ADDED – NOTHING REMOVED) ================= */
  const validateLeadForm = () => {
    const newErrors = {};

    // ✅ Client Name (only characters)
    if (!leadForm.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    } else if (!/^[A-Za-z\s]+$/.test(leadForm.clientName)) {
      newErrors.clientName = "Only characters allowed";
    }

    // ✅ Client Company (only characters)
    if (!leadForm.clientCompany.trim()) {
      newErrors.clientCompany = "Client company is required";
    } else if (!/^[A-Za-z\s]+$/.test(leadForm.clientCompany)) {
      newErrors.clientCompany = "Only characters allowed";
    }

    // ✅ Email
    if (!leadForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadForm.email)) {
      newErrors.email = "Enter valid email (must contain @ and .)";
    }

    // ✅ Mobile (exactly 10 digits)
    if (!leadForm.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(leadForm.mobile)) {
      newErrors.mobile = "Mobile must be exactly 10 digits";
    }

    // ✅ Project Type
    if (!leadForm.projectType.trim()) {
      newErrors.projectType = "Project type is required";
    }

    // ✅ Status
    if (!leadForm.status) {
      newErrors.status = "Status is required";
    }

    // ✅ Follow Up Date
    if (leadForm.status === "Follow Up" && !leadForm.followUpDate) {
      newErrors.followUpDate = "Follow up date is required";
    }

    // ✅ Timeline validation
    if (!hideTimeline && leadForm.status !== "Follow Up") {
      if (!leadForm.timeline.startDate) {
        newErrors.timeline = "Start date is required";
      }

      if (!leadForm.timeline.endDate) {
        newErrors.timeline = "End date is required";
      }

      if (
        leadForm.timeline.startDate &&
        leadForm.timeline.endDate &&
        new Date(leadForm.timeline.startDate) >
        new Date(leadForm.timeline.endDate)
      ) {
        newErrors.timeline = "End date cannot be before start date";
      }
    }

    // ✅ Budget (only numbers)
    if (!leadForm.budget) {
      newErrors.budget = "Budget is required";
    } else if (!/^[0-9]+$/.test(leadForm.budget)) {
      newErrors.budget = "Budget must contain only numbers";
    }

    setErrors(newErrors);

    // 🔴 Popup error
    if (Object.keys(newErrors).length > 0) {
      alert("Please fill all mandatory fields correctly.");
      return false;
    }

    return true;
  };



  /* ================= FETCH LEADS ================= */
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await fetch("http://localhost:5000/api/leads", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
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

  /* ================= EDIT ================= */
  const handleEdit = (lead) => {
    setEditLeadId(lead._id);
    setLeadForm({
      clientName: lead.clientName || "",
      clientCompany: lead.clientCompany || "",
      email: lead.email || "",
      mobile: lead.mobile || "",
      projectType: lead.projectType || "",
      status: lead.status || "Follow Up",
      followUpDate: lead.followUpDate
        ? lead.followUpDate.slice(0, 10)
        : "",
      timeline: {
        startDate: lead.timeline?.startDate
          ? lead.timeline.startDate.slice(0, 10)
          : "",
        endDate: lead.timeline?.endDate
          ? lead.timeline.endDate.slice(0, 10)
          : "",
      },
      budget: lead.budget || "",
      reference: lead.reference || "",
    });
    setErrors({});
    setShowAddLead(true);

  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      const token = localStorage.getItem("authToken");

      await fetch(`http://localhost:5000/api/leads/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchLeads();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };
  const getLeadSortDate = (lead) => {
    if (lead.followUpDate) return new Date(lead.followUpDate);
    if (lead.timeline?.startDate) return new Date(lead.timeline.startDate);
    if (lead.timeline?.endDate) return new Date(lead.timeline.endDate);
    return new Date(0); // fallback
  };

  /* ================= SAVE ================= */
  const handleSaveLead = async () => {
    if (!validateLeadForm()) return; // ⛔ ADDED

    try {
      const token = localStorage.getItem("authToken");

      const url = editLeadId
        ? `http://localhost:5000/api/leads/${editLeadId}`
        : "http://localhost:5000/api/leads";

      const method = editLeadId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...leadForm,
          followUpDate:
            leadForm.status === "Follow Up"
              ? leadForm.followUpDate
              : null,
          budget: leadForm.budget ? Number(leadForm.budget) : undefined,
        }),


      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert(editLeadId ? "Lead updated ✅" : "Lead added ✅");

      setShowAddLead(false);
      setEditLeadId(null);
      fetchLeads();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const sortedLeads = [...leads].sort(
    (a, b) => getLeadSortDate(a) - getLeadSortDate(b)
  );

  const paginatedLeads = sortedLeads.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );


  const hideTimeline =
    leadForm.status === "Not Interested" ||
    leadForm.status === "Closed" ||
    leadForm.status === "Pending";

  const getNextDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="projectlead-page">
      <div className="pl-cards">
        <div className="pl-card purple">
          <h6>Total Leads</h6>
          <h3>{leads.length}</h3>
        </div>
        <div className="pl-card pink">
          <h6>Total Deals</h6>
          <h3>5034K</h3>
        </div>
        <div className="pl-card blue">
          <h6>Lead Conversion</h6>
          <h3>36%</h3>
        </div>
        <div className="pl-card lavender">
          <h6>Avg Deal / Employee</h6>
          <h3>50</h3>
        </div>
      </div>

      <div className="filter-bar top-bar">
        <button
          className="add-lead-btn"
          onClick={() => {
            setEditLeadId(null); // ✅ ensure add mode
            setShowAddLead(true);
          }}
        >
          + Add Lead
        </button>
      </div>

      <div className="filter-card">
        <h3>Leads List</h3>
        <div className="table-scroll">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Company</th>
                <th>User Email</th>
                <th>Mobile</th>
                <th>Project Type</th>
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
                  <td>{lead.projectType}</td>
                  <td>{lead.status}</td>
                  <td>
                    {/* ✅ FIXED MORE BUTTON */}
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
                    <button className="edit-btn" onClick={() => handleEdit(lead)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(lead._id)}
                      style={{ marginLeft: "6px" }}
                    >
                      Delete
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

      </div>

      {/* ADD / EDIT MODAL (UNCHANGED UI) */}
      {showAddLead && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editLeadId ? "Edit Lead" : "Add Lead"}</h3>

            <input
              placeholder="Client Name"
              value={leadForm.clientName}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  clientName: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                })
              }
            />
            {errors.clientName && <small className="error">{errors.clientName}</small>}

            <input
              placeholder="Client Company"
              value={leadForm.clientCompany}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  clientCompany: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                })
              }
            />
            {errors.clientCompany && <small className="error">{errors.clientCompany}</small>}


            <input
              placeholder="User Email"
              value={leadForm.email}
              onChange={(e) =>
                setLeadForm({ ...leadForm, email: e.target.value })
              }
            />
            {errors.email && <small className="error">{errors.email}</small>}


            <input
              placeholder="Mobile"
              maxLength={10}
              value={leadForm.mobile}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
            />
            {errors.mobile && <small className="error">{errors.mobile}</small>}


            <input
              placeholder="Project Type"
              value={leadForm.projectType}
              onChange={(e) =>
                setLeadForm({ ...leadForm, projectType: e.target.value })
              }
            />

            <select
              value={leadForm.status}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  status: e.target.value,
                })
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
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
                  <small className="error">{errors.followUpDate}</small>
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
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  budget: e.target.value.replace(/\D/g, ""),
                })
              }
            />
            {errors.budget && <small className="error">{errors.budget}</small>}


            <input
              placeholder="Reference"
              value={leadForm.reference}
              onChange={(e) =>
                setLeadForm({ ...leadForm, reference: e.target.value })
              }
            />

            <div className="filter-actions">
              <button className="apply" onClick={handleSaveLead}>
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

      {/* ✅ VIEW-ONLY MORE MODAL */}
      {showMoreModal && selectedLead && (
        <div className="modal-backdrop">
          <div className="modal small">
            <h3>More Details</h3>

            {selectedLead?.status === "Follow Up" && (
              <p>
                <b>Follow Up Date:</b>{" "}
                {selectedLead.followUpDate
                  ? selectedLead.followUpDate.slice(0, 10)
                  : "-"}
              </p>
            )}

            <p>
              <b>Start Date:</b>{" "}
              {selectedLead.timeline?.startDate?.slice(0, 10) || "-"}
            </p>

            <p>
              <b>End Date:</b>{" "}
              {selectedLead.timeline?.endDate?.slice(0, 10) || "-"}
            </p>

            <p>
              <b>Budget:</b> {selectedLead.budget || "-"}
            </p>

            <p>
              <b>Reference:</b> {selectedLead.reference || "-"}
            </p>

            <div className="filter-actions">
              <button
                className="reset"
                onClick={() => {
                  setShowMoreModal(false);
                  setSelectedLead(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {!hideTimeline && (
        <>
          {/* YOUR EXISTING Start Date input */}
          {/* YOUR EXISTING End Date input */}
          {errors.timeline && <small>{errors.timeline}</small>}
        </>
      )}
    </div>
  );
};

export default ProjectLead;
