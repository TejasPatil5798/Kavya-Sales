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
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.email) return;

      // Only this user's tasks
      const userTasks = res.data.filter((task) => task.userMail === user.email);

      setTasks(userTasks || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchTasks();
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  /* CREATE CHART */
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!tasks.length) return;

    // Get only completed tasks
    const completedTasks = tasks.filter((t) => t.status === "Completed");

    // Group by date
    const dateMap = {};

    completedTasks.forEach((task) => {
      if (!task.taskDate) return;

      const date = new Date(task.taskDate).toISOString().split("T")[0]; // only YYYY-MM-DD

      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    const labels = Object.keys(dateMap).sort();
    const data = labels.map((date) => dateMap[date]);

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar", // weekly style
      data: {
        labels,
        datasets: [
          {
            label: "Completed Tasks",
            data,
            backgroundColor: "#4CAF50",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }, [tasks]);

  return (
    <div className="user-dashboard">
      <h1>Welcome User</h1>

      <div className="kpi-card glass-card gradient-blue">
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{tasks.length}</p>
        </div>

        <div className="kpi-card glass-card gradient-purple">
          <h3>Completed Tasks</h3>
          <p>{tasks.filter((t) => t.status === "Completed").length}</p>
        </div>

        <div className="kpi-card glass-card gradient-orange">
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
