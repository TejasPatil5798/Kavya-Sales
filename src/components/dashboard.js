import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
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

  // ✅ Fetch employee count from registered users (ONLY ADDITION)
  const fetchEmployeeCount = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        "http://localhost:5000/api/users/count/employees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setEmployeeCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching employee count", error);
      setEmployeeCount(0);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        "http://localhost:5000/api/dashboard/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      setTotalTarget(data.totalTarget || 0);
      setTotalAchieved(data.totalAchieved || 0);
      setAchievementPercent(data.achievementPercent || 0);
      setSalesData(data.weeklySales || []);
      setPerformanceData(data.topPerformers || []);
    } catch (error) {
      console.error("Dashboard fetch error", error);
    }
  };


  useEffect(() => {
    fetchEmployeeCount(); // ✅ ONLY CALL ADDED
    fetchDashboardData();

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


    // ✅ CLEANUP ON UNMOUNT
    return () => {
      if (salesChartRef.current) {
        salesChartRef.current.destroy();
      }
      if (performanceChartRef.current) {
        performanceChartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="dashboard">
      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card purple">
          <h2>Employee Count</h2>
          <h3>{employeeCount}</h3>
        </div>

        <div className="kpi-card pink">
          <h2>Meet Target (%)</h2>
          <h3>{achievementPercent}%</h3>
        </div>

        <div className="kpi-card blue">
          <h2>Sales Target</h2>
          <h3>₹{totalTarget.toLocaleString()}</h3>
        </div>

        <div className="kpi-card lavender">
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

        {/* <div className="card">
          <div className="card-header">Recent Sales Achieved</div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Target</th>
                  <th>Achieved</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Amit</td>
                  <td>₹50,000</td>
                  <td>₹45,000</td>
                </tr>
                <tr>
                  <td>Neha</td>
                  <td>₹60,000</td>
                  <td>₹58,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> */}
      </div>

      {/* TOP PERFORMANCE */}
      <div className="card full-width">
        <div className="card-header">Top 10 Performer (Daily)</div>
        <div className="card-body chart-container">
          <canvas id="topPerformanceChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
