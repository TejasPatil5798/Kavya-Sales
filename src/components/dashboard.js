import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./dashboard.css";

const Dashboard = () => {
  const salesChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  // ✅ Employee Count state (ONLY ADDITION)
  const [employeeCount, setEmployeeCount] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalAchieved, setTotalAchieved] = useState(0);
  const [achievementPercent, setAchievementPercent] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [period, setPeriod] = useState("weekly");

  // ✅ Fetch employee count from registered users (ONLY ADDITION)
  const fetchEmployeeCount = async () => {
    try {
      const { data } = await API.get("/users/count/employees");
      setEmployeeCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching employee count", error);
      setEmployeeCount(0);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data } = await API.get(`/dashboard/summary?period=${period}`);
      setPerformanceData(data.topPerformers || []);
    } catch (error) {
      console.error("Dashboard fetch error", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  useEffect(() => {
    fetchEmployeeCount(); // ✅ ONLY CALL ADDED
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const salesCtx = document.getElementById("salesChart");
    const performanceCtx = document.getElementById("topPerformanceChart");

    // 🔥 DESTROY old charts if they exist
    if (salesChartRef.current) {
      salesChartRef.current.destroy();
    }
    if (performanceChartRef.current) {
      performanceChartRef.current.destroy();
    }

    // SALES OVERVIEW CHART
    if (salesCtx && salesData.length > 0) {
      salesChartRef.current = new Chart(salesCtx, {
        type: "line",
        data: {
          labels: salesData.map((d) => d.day),
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
        },
      });
    }

    // TOP PERFORMANCE CHART
    if (performanceCtx && performanceData.length > 0) {
      performanceChartRef.current = new Chart(performanceCtx, {
        type: "bar",
        data: {
          labels: performanceData.map((p) => p.name),
          datasets: [
            {
              label: "Completed Tasks",
              data: performanceData.map((p) => p.achievement),
              backgroundColor: performanceData.map((_, index) =>
                index === 0 ? "#FFD700" : "#de638a",
              ),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    // ✅ CLEANUP ON UNMOUNT
    return () => {
      if (salesChartRef.current) {
        salesChartRef.current.destroy();
      }
      if (performanceChartRef.current) {
        performanceChartRef.current.destroy();
      }
    };
  }, [salesData, performanceData]);

  return (
    <div className="dashboard">
      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card glass-card gradient-blue">
          <h2>Employee Count</h2>
          <h3>{employeeCount}</h3>
        </div>

        <div className="kpi-card glass-card gradient-purple">
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
      <div className="chart-grid">
        <div className="card">
          <div className="card-header">Sales Overview</div>
          <div className="card-body chart-container">
            <canvas id="salesChart"></canvas>
          </div>
        </div>
      </div>

      {/* TOP PERFORMANCE */}
      <div className="card full-width">
        <div className="card-header1">
          <p>Top 10 Performer ({period.toUpperCase()})</p>
          <div className="time-buttons">
            <button onClick={() => setPeriod("daily")}>Daily</button>
            <button onClick={() => setPeriod("weekly")}>Weekly</button>
            <button onClick={() => setPeriod("monthly")}>Monthly</button>
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
