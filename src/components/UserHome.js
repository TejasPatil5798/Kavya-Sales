import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./UserHome.css";

const UserHome = () => {
  const activityChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  const [tasks, setTasks] = useState([]);

  /* ================= FETCH USER TASKS ================= */
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.email) return;

      const userTasks = res.data.filter(
        (task) => task.userMail === user.email
      );

      setTasks(userTasks);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

    const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (t) => t.status === "Pending"
  ).length;

  const performanceScore =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

    return () => {
      if (activityChartRef.current) activityChartRef.current.destroy();
      if (performanceChartRef.current) performanceChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="dashboard">
      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card purple">
          <h2>Assigned Projects</h2>
          <h3>6</h3>
        </div>

        <div className="kpi-card pink">
          <h2>Completed Tasks</h2>
          <h3>{completedTasks}</h3>
        </div>

        <div className="kpi-card blue">
          <h2>Pending Tasks</h2>
          <h3>{pendingTasks}</h3>
        </div>

        <div className="kpi-card lavender">
          <h2>Performance Score</h2>
          <h3>{performanceScore}%</h3>
        </div>
      </div>

      {/* CHARTS */}
      <div className="chart-grid">
        <div className="card">
          <div className="card-header">Weekly Activity</div>
          <div className="card-body chart-container">
            <canvas id="activityChart"></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Recent Work</div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Project Lead Review</td>
                  <td>Completed</td>
                </tr>
                <tr>
                  <td>Project Intake Form</td>
                  <td>Pending</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PERFORMANCE */}
      <div className="card full-width">
        <div className="card-header">Your Performance Overview</div>
        <div className="card-body chart-container">
          <canvas id="userPerformanceChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
