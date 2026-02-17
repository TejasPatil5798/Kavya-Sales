import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./ProjectIntake.css";

const ITEMS_PER_PAGE = 10;

const UserProjectIntake = () => {
  const lineChartRef = useRef(null);
  const typeChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const barChartRef = useRef(null);

  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  /* ================= FETCH LEADS (READ ONLY) ================= */
  const fetchLeads = async () => {
    try {
      const { data } = await API.get("/leads/my-leads");
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

  return (
    <div className="intake-page">
      {/* KPI */}
      <div className="intake-cards">
        <div className="intake-card purple">
          <small>Total Projects</small>
          <h3>{projects.length}</h3>
        </div>

        <div className="intake-card pink">
          <small>Active Projects</small>
          <h3>{projects.length}</h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="filter-card">
        <div className="table-header">
          <h3>Project List</h3>
          {/* ❌ NO ADD BUTTON FOR USER */}
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
                <th>More</th>
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
                      className="view-btn"
                      onClick={() => {
                        setSelectedProject(p);
                        setShowViewModal(true);
                      }}
                    >
                      More
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedProjects.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
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
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
          >
            Next ▶
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedProject && (
        <div className="modal-backdrop">
          <div className="modal small">
            <h3>Project Details</h3>
            {selectedProject.status === "Follow Up" ? (
              <p>
                <b>Follow Up Date:</b>{" "}
                {selectedProject.followUpDate
                  ? new Date(selectedProject.followUpDate).toLocaleDateString()
                  : "-"}
              </p>
            ) : (
              <>
                <p>
                  <b>Start Date:</b>{" "}
                  {selectedProject.timeline?.startDate
                    ? new Date(
                      selectedProject.timeline.startDate
                    ).toLocaleDateString()
                    : "-"}
                </p>

                <p>
                  <b>End Date:</b>{" "}
                  {selectedProject.timeline?.endDate
                    ? new Date(
                      selectedProject.timeline.endDate
                    ).toLocaleDateString()
                    : "-"}
                </p>
              </>
            )}
            <p>
              <b>Reference:</b> {selectedProject.reference || "-"}
            </p>

            <p>
              <b>Budget:</b> {selectedProject.budget || "-"}
            </p>

            <button
              className="reset"
              onClick={() => setShowViewModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProjectIntake;

