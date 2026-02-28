import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./dashboard.css";

const Dashboard = () => {
  const salesChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  // ✅ SAME LOGIC AS EMPLOYEES PAGE
  const [employees, setEmployees] = useState([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalAchieved, setTotalAchieved] = useState(0);
  const [achievementPercent, setAchievementPercent] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [salesPeriod, setSalesPeriod] = useState("weekly");

  // ✅ FETCH ALL USERS (same as Employees.js)
  const fetchEmployees = async () => {
    try {
      const { data } = await API.get("/users/all");
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees", error);
      setEmployees([]);
    }
  };

  const fetchDashboardData = async (period = "weekly") => {
    try {
      const { data } = await API.get(`/dashboard/summary?period=${period}`);

      // KPI
      setTotalTarget(data.totalTarget || 0);
      setTotalAchieved(data.totalAchieved || 0);
      setAchievementPercent(data.achievementPercent || 0);

      // Sales Chart
      setSalesData(data.sales || data.weeklySales || []);

      // Performance Chart
      setPerformanceData(data.topPerformers || []);
    } catch (error) {
      console.error("Dashboard fetch error", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchDashboardData(salesPeriod);
  }, [salesPeriod]);

  // 🔥 CHART EFFECT (separate for correct rendering)
  useEffect(() => {
    const salesCtx = document.getElementById("salesChart")?.getContext("2d");
    const performanceCtx = document
      .getElementById("topPerformanceChart")
      ?.getContext("2d");

    if (salesChartRef.current) {
      salesChartRef.current.destroy();
    }
    if (performanceChartRef.current) {
      performanceChartRef.current.destroy();
    }

    if (salesCtx && salesData.length > 0) {
      salesChartRef.current = new Chart(salesCtx, {
        type: "line",
        data: {
          labels: salesData.map((d) => d.label),
          datasets: [
            {
              label: "Sales",
              data: salesData.map((d) => d.amount),
              borderColor: "#124c81",
              backgroundColor: "rgba(18,76,129,0.2)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "₹" + value.toLocaleString();
                },
              },
            },
          },
        },
      });
    }

    if (performanceCtx && performanceData.length > 0) {
      performanceChartRef.current = new Chart(performanceCtx, {
        type: "bar",
        data: {
          labels: performanceData.map((p) => p.name),
          datasets: [
            {
              label: "Performance",
              data: performanceData.map((p) => p.achievement),
              backgroundColor: "#de638a",
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
      if (salesChartRef.current) salesChartRef.current.destroy();
      if (performanceChartRef.current) performanceChartRef.current.destroy();
    };
  }, [salesData, performanceData]);

  // ✅ EXACT SAME COUNT AS EMPLOYEES PAGE
  const totalEmployees = employees.length;

  return (
    <div className="dashboard">
      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card glass-card gradient-blue ">
          <h2>Employee Count</h2>
          <h3>{totalEmployees}</h3>
        </div>

        <div className="kpi-card glass-card gradient-purple ">
          <h2>Meet Target (%)</h2>
          <h3>{achievementPercent}%</h3>
        </div>

        <div className="kpi-card glass-card gradient-pink">
          <h2>Sales Target</h2>
          <h3>₹{totalTarget.toLocaleString()}</h3>
        </div>

        <div className="kpi-card glass-card gradient-orange">
          <h2>Sales Achieved</h2>
          <h3>₹{totalAchieved.toLocaleString()}</h3>
        </div>
      </div>

      {/* CHARTS */}

      {/* SALES OVERVIEW */}
      <div className="card full-width">
        <div className="card-header1">
          <h2>Sales Overview</h2>
          <div className="time-buttons">
            <button
              className={salesPeriod === "weekly" ? "active-btn" : ""}
              onClick={() => setSalesPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={salesPeriod === "monthly" ? "active-btn" : ""}
              onClick={() => setSalesPeriod("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="card-body chart-container">
          <canvas id="salesChart"></canvas>
        </div>
      </div>

      {/* TOP PERFORMANCE */}
      <div className="card full-width">
        <div className="card-header1">
          <p>Top 10 Performer ({salesPeriod.toUpperCase()})</p>
          <div className="time-buttons">
            <button
              className={salesPeriod === "daily" ? "active-btn" : ""}
              onClick={() => setSalesPeriod("daily")}
            >
              Daily
            </button>

            <button
              className={salesPeriod === "weekly" ? "active-btn" : ""}
              onClick={() => setSalesPeriod("weekly")}
            >
              Weekly
            </button>

            <button
              className={salesPeriod === "monthly" ? "active-btn" : ""}
              onClick={() => setSalesPeriod("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="card-body chart-container">
          <canvas id="topPerformanceChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
