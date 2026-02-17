import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";   // ✅ ADD THIS
import "./ResourceAllocation.css";

const ResourceAllocation = () => {
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);

  const [allocation, setAllocation] = useState({
    allocation_id: "",
    project_name: "",
    project_id: "",
    it_team: "",
    tl_name: "",
    start_date: "",
    end_date: "",
  });

  const [allocations, setAllocations] = useState([]);
  const [viewItem, setViewItem] = useState(null);

  const [editItem, setEditItem] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    API.get("/allocations")
      .then((res) => setAllocations(res.data))
      .catch(() => alert("Failed to load allocations"));
  }, []);


  /* ================= FORM ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "end_date" && allocation.start_date) {
      if (new Date(value) < new Date(allocation.start_date)) {
        alert("End date cannot be before start date");
        return;
      }
    }

    setAllocation({ ...allocation, [name]: value });
  };

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.project_name.trim())
      newErrors.project_name = "Project name is required";

    if (!data.project_id)
      newErrors.project_id = "Project ID is required";

    if (!data.it_team)
      newErrors.it_team = "IT Team is required";

    if (!data.tl_name.trim())
      newErrors.tl_name = "Team Lead name is required";

    if (!data.start_date)
      newErrors.start_date = "Start date is required";

    if (!data.end_date)
      newErrors.end_date = "End date is required";

    if (data.start_date && data.end_date) {
      if (new Date(data.end_date) < new Date(data.start_date)) {
        newErrors.end_date = "End date cannot be before start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm(allocation)) return;

    try {
      const res = await API.post("/allocations", allocation);
      const saved = res.data;

      setAllocations([saved, ...allocations]);

      setAllocation({
        allocation_id: "",
        project_name: "",
        project_id: "",
        it_team: "",
        tl_name: "",
        start_date: "",
        end_date: "",
      });

      setErrors({});
    } catch {
      alert("Server not reachable");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this allocation?"))
      return;

    await API.delete(`/allocations/${id}`);
    setAllocations(allocations.filter((a) => a._id !== id));
  };


  const totalPages = Math.ceil(allocations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedAllocations = allocations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="resource-page">
      {/* KPI */}
      <div className="kpi-row">
        <div className="kpi-card pink">
          <h2>Total IT Teams</h2>
          <p>5</p>
        </div>
        <div className="kpi-card lavender">
          <h2>Total Projects</h2>
          <p>25</p>
        </div>
      </div>

      {/* FORM */}
      <form className="allocation-form" onSubmit={handleSubmit}>
        <h4>Resource Allocation</h4>

        <input
          name="project_name"
          placeholder="Project name"
          value={allocation.project_name}
          onChange={handleChange}
        />
        {errors.project_name && (
          <small className="error-text">{errors.project_name}</small>
        )}

        <input
          type="number"
          name="project_id"
          placeholder="Project ID"
          value={allocation.project_id}
          onChange={handleChange}
        />
        {errors.project_id && (
          <small className="error-text">{errors.project_id}</small>
        )}

        <select
          name="it_team"
          value={allocation.it_team}
          onChange={handleChange}
        >


          <option value="">Select IT Team</option>
          <option>Team 1</option>
          <option>Team 2</option>
          <option>Team 3</option>
          <option>Team 4</option>
          <option>Team 5</option>
          <option>Team 6</option>
          <option>Team 7</option>
          <option>Team 8</option>
          <option>Team 9</option>
          <option>Team 10</option>
        </select>
        {errors.it_team && (
          <small className="error-text">{errors.it_team}</small>
        )}

        <input
          name="tl_name"
          placeholder="Team Lead name"
          value={allocation.tl_name}
          onChange={handleChange}
          required
        />
        {errors.tl_name && (
          <small className="error-text">{errors.tl_name}</small>
        )}

        <input
          type="date"
          name="start_date"
          value={allocation.start_date}
          onChange={handleChange}
        />
        {errors.start_date && (
          <small className="error-text">{errors.start_date}</small>
        )}

        <input
          type="date"
          name="end_date"
          value={allocation.end_date}
          onChange={handleChange}
          min={allocation.start_date}
        />
        {errors.end_date && (
          <small className="error-text">{errors.end_date}</small>
        )}

        <button type="submit" className="save-btn">
          Save Allocation
        </button>
      </form>

      {/* LIST TABLE */}
      {allocations.length > 0 && (
        <div className="table-scroll">
          <table className="allocation-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>ID</th>
                <th>Team</th>
                <th>Lead</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedAllocations.map((item, index) => (
                <tr key={index}>
                  <td>{item.project_name}</td>
                  <td>{item.project_id}</td>
                  <td>{item.it_team}</td>
                  <td>{item.tl_name}</td>
                  <td>{item.start_date}</td>
                  <td>{item.end_date}</td>
                  <td>
                    <button onClick={() => setViewItem(item)}>View</button>
                    <button
                      onClick={() => {
                        setEditItem({ ...item });
                        setEditIndex(index);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ PAGINATION MUST BE HERE */}
          <div className="pagination">
            <button
              disabled={currentPage === 1}
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}


      {/* VIEW MODAL */}
      {viewItem && (
        <div className="view-modal-backdrop">
          <div className="view-modal">
            <h3>Allocation Details</h3>

            <div className="view-row">
              <span>Project</span>
              <p>{viewItem.project_name}</p>
            </div>
            <div className="view-row">
              <span>Project ID</span>
              <p>{viewItem.project_id}</p>
            </div>
            <div className="view-row">
              <span>IT Team</span>
              <p>{viewItem.it_team}</p>
            </div>
            <div className="view-row">
              <span>Team Lead</span>
              <p>{viewItem.tl_name}</p>
            </div>
            <div className="view-row">
              <span>Start Date</span>
              <p>{viewItem.start_date}</p>
            </div>
            <div className="view-row">
              <span>End Date</span>
              <p>{viewItem.end_date}</p>
            </div>

            <div className="view-modal-actions">
              <button onClick={() => setViewItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div className="view-modal-backdrop">
          <div className="view-modal">
            <h3>Edit Allocation</h3>

            <input
              value={editItem.project_name}
              onChange={(e) =>
                setEditItem({ ...editItem, project_name: e.target.value })
              }
              className={errors.project_name ? "error" : ""}
            />
            {errors.project_name && (
              <small className="error-text">{errors.project_name}</small>
            )}

            <input
              type="number"
              value={editItem.project_id}
              onChange={(e) =>
                setEditItem({ ...editItem, project_id: e.target.value })
              }
              className={errors.project_id ? "error" : ""}
            />
            {errors.project_id && (
              <small className="error-text">{errors.project_id}</small>
            )}


            <select
              value={editItem.it_team}
              onChange={(e) =>
                setEditItem({ ...editItem, it_team: e.target.value })
              }
              className={errors.it_team ? "error" : ""}
            >
              <option value="">Select IT Team</option>
              <option>Team 1</option>
              <option>Team 2</option>
              <option>Team 3</option>
              <option>Team 4</option>
              <option>Team 5</option>
              <option>Team 6</option>
              <option>Team 7</option>
              <option>Team 8</option>
              <option>Team 9</option>
              <option>Team 10</option>
            </select>

            {errors.it_team && (
              <small className="error-text">{errors.it_team}</small>
            )}

            <input
              value={editItem.tl_name}
              onChange={(e) =>
                setEditItem({ ...editItem, tl_name: e.target.value })
              }
              className={errors.tl_name ? "error" : ""}
            />
            {errors.tl_name && (
              <small className="error-text">{errors.tl_name}</small>
            )}

            <input
              type="date"
              value={editItem.start_date}
              onChange={(e) =>
                setEditItem({ ...editItem, start_date: e.target.value })
              }
              className={errors.start_date ? "error" : ""}
            />
            {errors.start_date && (
              <small className="error-text">{errors.start_date}</small>
            )}

            <input
              type="date"
              value={editItem.end_date}
              onChange={(e) =>
                setEditItem({ ...editItem, end_date: e.target.value })
              }
              min={editItem.start_date}
              className={errors.end_date ? "error" : ""}
            />
            {errors.end_date && (
              <small className="error-text">{errors.end_date}</small>
            )}

            <div className="view-modal-actions">
              <button
                onClick={async () => {

                  if (!validateForm(editItem)) return;

                  const res = await API.put(`/allocations/${editItem._id}`, editItem);
                  const updated = res.data;

                  setAllocations(
                    allocations.map((a) =>
                      a._id === updated._id ? updated : a
                    )
                  );

                  setEditItem(null);
                  setErrors({});
                }}
              >
                Save
              </button>



              <button
                className="cancel-btn"
                onClick={() => {
                  setEditItem(null);
                  setEditIndex(null);
                }}
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

export default ResourceAllocation;
