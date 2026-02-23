import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  /* FETCH TASKS */
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");

      // Get logged in user from localStorage
      const user = JSON.parse(localStorage.getItem("user"));

      // Only this user's tasks
      const userTasks = res.data.filter((task) => task.userMail === user.email);

      setTasks(userTasks);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();

    const interval = setInterval(() => {
      fetchTasks();
    }, 5000); // refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  /* CREATE CHART */
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!tasks.length) return;

    const completed = tasks.filter((t) => t.status === "Completed").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;

    chartInstance.current = new Chart(chartRef.current, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Pending", "In Progress"],
        datasets: [
          {
            data: [completed, pending, inProgress],
            backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"],
          },
        ],
      },
    });
  }, [tasks]);

  return (
    <div className="user-dashboard">
      <h1>Welcome User</h1>

      <div className="user-cards">
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{tasks.length}</p>
        </div>

        <div className="card">
          <h3>Completed Tasks</h3>
          <p>{tasks.filter((t) => t.status === "Completed").length}</p>
        </div>

        <div className="card">
          <h3>Status</h3>
          <p>Active</p>
        </div>
      </div>

      {/* CHART */}
      <div style={{ width: "400px", marginTop: "40px" }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default UserDashboard;
