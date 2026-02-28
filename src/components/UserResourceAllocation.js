import { useEffect, useState } from "react";
import API from "../api/api";
import "./UserResourceAllocation.css";

const ITEMS_PER_PAGE = 10;

const UserResourceAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* ================= FETCH DATA (READ ONLY) ================= */
  const fetchAllocations = async () => {
    try {
      const { data } = await API.get("/allocations");

      // ✅ MAP BACKEND FIELDS → EXISTING UI FIELDS (NO UI CHANGE)
      const mappedData = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            employeeName: item.tl_name, // mapped
            projectName: item.project_name, // mapped
            role: item.it_team, // mapped
            allocationPercentage: 100, // default / placeholder
            status: "Active", // default / placeholder
            startDate: item.start_date, // mapped
            endDate: item.end_date, // mapped
          }))
        : [];

      setAllocations(mappedData);
    } catch (err) {
      console.error("Error fetching resource allocation", err);
      setAllocations([]);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  /* ================= SEARCH + FILTER ================= */
  const filteredAllocations = allocations.filter((item) => {
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const text = `
    ${item.employeeName || ""}
    ${item.projectName || ""}
    ${item.role || ""}
  `.toLowerCase();

    const matchesSearch = text.includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });
  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredAllocations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAllocations = filteredAllocations.slice(
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
    <div className="resource-page">
      {/* KPI */}
      <div className="ra-cards">
        <div className="kpi-card glass-card gradient-pink">
          <small>Total Resources</small>
          <h3>{allocations.length}</h3>
        </div>

        <div className="kpi-card glass-card gradient-orange">
          <small>Active Allocations</small>
          <h3>
            {
              allocations.filter((a) => a.status && a.status !== "Completed")
                .length
            }
          </h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="filter-card">
        <div
          className="table-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h3>Resource Allocation List</h3>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search employee, project, role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                minWidth: "250px",
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
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table className="leads-table-res">
            <thead style={{color: "white", borderRadius: "14px 14px 0 0"}}>
              <tr>
                <th>Employee</th>
                <th>Project</th>
                <th>Role</th>
                <th>Allocation (%)</th>
                <th>Status</th>
                <th>More</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAllocations.map((item) => (
                <tr key={item._id}>
                  <td>{item.employeeName}</td>
                  <td>{item.projectName}</td>
                  <td>{item.role}</td>
                  <td>{item.allocationPercentage}%</td>
                  <td>{item.status}</td>
                  <td>
                    <button
                      className="edit-btn2"
                      onClick={() => {
                        setSelectedAllocation(item);
                        setShowViewModal(true);
                      }}
                    >
                      More
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedAllocations.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No resource allocations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1 || totalPages === 0}
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
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next ▶
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedAllocation && (
        <div className="modal-backdrop">
          <div className="modal small">
            <h3>Allocation Details</h3>

            <p>
              <b>Employee:</b> {selectedAllocation.employeeName}
            </p>
            <p>
              <b>Project:</b> {selectedAllocation.projectName}
            </p>
            <p>
              <b>Role:</b> {selectedAllocation.role}
            </p>
            <p>
              <b>Allocation:</b> {selectedAllocation.allocationPercentage}%
            </p>
            <p>
              <b>Status:</b> {selectedAllocation.status}
            </p>

            <p>
              <b>Start Date:</b>{" "}
              {selectedAllocation.startDate
                ? new Date(selectedAllocation.startDate).toLocaleDateString()
                : "-"}
            </p>

            <p>
              <b>End Date:</b>{" "}
              {selectedAllocation.endDate
                ? new Date(selectedAllocation.endDate).toLocaleDateString()
                : "-"}
            </p>

            <button className="reset" onClick={() => setShowViewModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserResourceAllocation;
