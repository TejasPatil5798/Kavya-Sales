import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./UserHome.css";

const UserHome = () => {
  const activityChartRef = useRef(null);
  const performanceChartRef = useRef(null);
  const [tasks, setTasks] = useState([]);

  /* ================= FETCH USER TASKS ================= */
  useEffect(() => {
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

    fetchTasks();
  }, []);

  /* ================= CALCULATIONS ================= */
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

  /* ================= CHARTS ================= */
  useEffect(() => {
    const activityCtx = document.getElementById("activityChart");
    const performanceCtx = document.getElementById("userPerformanceChart");

    if (activityChartRef.current) activityChartRef.current.destroy();
    if (performanceChartRef.current) performanceChartRef.current.destroy();

    if (activityCtx) {
      activityChartRef.current = new Chart(activityCtx, {
        type: "bar",
        data: {
          labels: ["Completed", "Pending"],
          datasets: [
            {
              label: "Tasks",
              data: [completedTasks, pendingTasks],
              backgroundColor: ["#de638a", "#124c81"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    if (performanceCtx) {
      performanceChartRef.current = new Chart(performanceCtx, {
        type: "doughnut",
        data: {
          labels: ["Performance %"],
          datasets: [
            {
              data: [performanceScore, 100 - performanceScore],
              backgroundColor: ["#8e44ad", "#e0e0e0"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    return () => {
      if (activityChartRef.current) activityChartRef.current.destroy();
      if (performanceChartRef.current) performanceChartRef.current.destroy();
    };
  }, [completedTasks, pendingTasks, performanceScore]);

  return (
    <div className="dashboard">
      <div className="kpi-grid">
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

      <div className="card full-width">
        <div className="card-header">Your Performance Overview</div>
        <div className="card-body chart-container">
          <canvas id="activityChart"></canvas>
        </div>
      </div>

      <div className="card full-width">
        <div className="card-header">Performance %</div>
        <div className="card-body chart-container">
          <canvas id="userPerformanceChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default UserHome;