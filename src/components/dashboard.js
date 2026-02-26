import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./dashboard.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
 
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
  const [period, setPeriod] = useState("weekly");
  const [selectedDate, setSelectedDate] = useState(new Date());
 
 
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
 
  const fetchDashboardData = async (
  selectedPeriod = "weekly",
  date = new Date()
) => {
  try {
    const formattedDate = date.toISOString();

    const { data } = await API.get(
      `/dashboard/summary?period=${selectedPeriod}&date=${formattedDate}`
    );

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
  fetchEmployees();
  fetchDashboardData(period, selectedDate);
}, [period, selectedDate]);
 
  // 🔥 CHART EFFECT (separate for correct rendering)
  useEffect(() => {
    const salesCtx = document.getElementById("salesChart");
    const performanceCtx = document.getElementById("topPerformanceChart");
 
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
              min: 200000,      // 2 Lakhs
              max: 2000000,     // 20 Lakhs
              ticks: {
                callback: function (value) {
                  return "₹" + value.toLocaleString();
                }
              }
            }
          }
        }
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
 
      <div className="chart-grid">
  <div className="sales-calendar-wrapper">

    {/* LEFT SIDE - GRAPH */}
    <div className="card sales-card">
      <div className="card-header">
        Sales Overview
        <div className="time-buttons">
          <button onClick={() => setPeriod("weekly")}>Weekly</button>
          <button onClick={() => setPeriod("monthly")}>Monthly</button>
        </div>
      </div>

      <div className="card-body chart-container">
        <canvas id="salesChart"></canvas>
      </div>
    </div>

    {/* RIGHT SIDE - CALENDAR */}
    <div className="card calendar-card">
      <div className="card-header">Calendar</div>
      <div className="card-body calendar-body">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
        />
      </div>
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
 