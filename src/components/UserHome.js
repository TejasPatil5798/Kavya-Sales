import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./UserHome.css";

const UserHome = () => {
  const activityChartRef = useRef(null);
  const performanceChartRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);

  /* ================= FETCH USER TASKS ================= */
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.email) return;

        const userTasks = res.data.filter(
          (task) => task.userMail === user.email,
        );

        setTasks(userTasks);
      } catch (err) {
        console.error("Failed to load tasks", err);
      }
    };

    fetchTasks();
  }, []);

  /* ================= FETCH USER LEADS ================= */
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await API.get("/leads/my-leads");
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load leads", err);
        setLeads([]);
      }
    };

    fetchLeads();
  }, []);

  /* ================= CALCULATIONS ================= */
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;

  const performanceScore =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  /* ================= FOLLOW UPS ================= */

  const totalFollowUps = leads.filter(
    (lead) => lead.status === "Follow Up",
  ).length;

  /* ================= LAST 7 DAYS (TODAY LAST) ================= */

  const today = new Date();
  const rollingDays = [];
  const rollingCounts = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const formattedDate = date.toISOString().split("T")[0];

    const dayLabel = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
    });

    rollingDays.push(dayLabel);

    const count = tasks.filter(
      (task) => task.status === "Completed" && task.taskDate === formattedDate,
    ).length;

    rollingCounts.push(count);
  }

  /* ================= TODAY PENDING TASKS ================= */

  const todayDate = new Date().toISOString().split("T")[0];

  const todaysPendingTasks = tasks.filter(
    (task) => task.status === "Pending" && task.taskDate === todayDate,
  );

  /* ================= CHARTS ================= */
  useEffect(() => {
    const activityCtx = document.getElementById("activityChart");

    if (activityChartRef.current) activityChartRef.current.destroy();

    if (activityCtx) {
      activityChartRef.current = new Chart(activityCtx, {
        type: "line",
        data: {
          labels: rollingDays,
          datasets: [
            {
              label: "Completed Tasks",
              data: rollingCounts,
              borderColor: "#124c81",
              backgroundColor: "rgba(18,76,129,0.2)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              precision: 0, // 🔥 ensures whole numbers only
            },
          },
        },
      });
    }

    return () => {
      if (activityChartRef.current) activityChartRef.current.destroy();
    };
  }, [tasks]);

  useEffect(() => {
    const performanceCtx = document.getElementById("userPerformanceChart");

    if (performanceChartRef.current) performanceChartRef.current.destroy();

    if (performanceCtx) {
      performanceChartRef.current = new Chart(performanceCtx, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Remaining"],
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
          cutout: "70%", // makes it modern donut style
        },
      });
    }

    return () => {
      if (performanceChartRef.current) performanceChartRef.current.destroy();
    };
  }, [performanceScore]);

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

        <div className="kpi-card purple">
          <h2>Follow-Up</h2>
          <h3>{totalFollowUps}</h3>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">Weekly Completed Tasks</div>
          <div className="card-body chart-container">
            <canvas id="activityChart"></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Today's Pending Tasks</div>
          <div className="card-body">
            {todaysPendingTasks.length === 0 ? (
              <p>No pending tasks for today 🎉</p>
            ) : (
              <ul>
                {todaysPendingTasks.map((task) => (
                  <li key={task._id}>
                    {task.client} - {task.taskType}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
