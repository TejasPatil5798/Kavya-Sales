import { useEffect, useState } from "react";
import "./UserResourceAllocation.css";

const ITEMS_PER_PAGE = 10;

const UserResourceAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  /* ================= FETCH DATA (READ ONLY) ================= */
  const fetchAllocations = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("http://localhost:5000/api/allocations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // ✅ MAP BACKEND FIELDS → EXISTING UI FIELDS (NO UI CHANGE)
      const mappedData = Array.isArray(data)
        ? data.map((item) => ({
          ...item,
          employeeName: item.tl_name,           // mapped
          projectName: item.project_name,       // mapped
          role: item.it_team,                   // mapped
          allocationPercentage: 100,             // default / placeholder
          status: "Active",                      // default / placeholder
          startDate: item.start_date,            // mapped
          endDate: item.end_date,                // mapped
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

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(allocations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAllocations = allocations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [allocations.length]);

  return (
    <div className="resource-page">
      {/* KPI */}
      <div className="ra-cards">
        <div className="ra-card purple">
          <small>Total Resources</small>
          <h3>{allocations.length}</h3>
        </div>

        <div className="ra-card blue">
          <small>Active Allocations</small>
          <h3>
            {
              allocations.filter(
                (a) => a.status && a.status !== "Completed"
              ).length
            }
          </h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="filter-card">
        <div className="table-header">
          <h3>Resource Allocation List</h3>
          {/* ❌ NO ADD BUTTON FOR USER */}
        </div>


        <div className="table-scroll">
          <table className="leads-table">
            <thead>
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
                      className="edit-btn"
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
              <b>Allocation:</b>{" "}
              {selectedAllocation.allocationPercentage}%
            </p>
            <p>
              <b>Status:</b> {selectedAllocation.status}
            </p>

            <p>
              <b>Start Date:</b>{" "}
              {selectedAllocation.startDate
                ? new Date(
                  selectedAllocation.startDate
                ).toLocaleDateString()
                : "-"}
            </p>

            <p>
              <b>End Date:</b>{" "}
              {selectedAllocation.endDate
                ? new Date(
                  selectedAllocation.endDate
                ).toLocaleDateString()
                : "-"}
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

export default UserResourceAllocation;
