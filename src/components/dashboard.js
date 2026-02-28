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
  const [salesPeriod, setSalesPeriod] = useState("weekly");
  const [performancePeriod, setPerformancePeriod] = useState("weekly");
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

  const fetchSalesData = async (period = "weekly", date = new Date()) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];

      const { data } = await API.get(
        `/dashboard/sales?period=${period}&date=${formattedDate}`,
      );

      setTotalTarget(data.totalTarget || 0);
      setTotalAchieved(data.totalAchieved || 0);
      setAchievementPercent(data.achievementPercent || 0);
      setSalesData(data.sales || []);
    } catch (error) {
      console.error("Sales fetch error", error);
    }
  };

  const fetchPerformanceData = async (period = "weekly", date = new Date()) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];

      const { data } = await API.get(
        `/dashboard/performance?period=${period}&date=${formattedDate}`,
      );

      setPerformanceData(data.topPerformers || []);
    } catch (error) {
      console.error("Performance fetch error", error);
    }
  };

  const fetchDashboardData = async (
    selectedSalesPeriod = "weekly",
    selectedPerformancePeriod = "weekly",
    date = new Date(),
  ) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];

      const { data } = await API.get(
        `/dashboard/summary?period=${selectedPerformancePeriod}&date=${formattedDate}`,
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
  }, []);

  // Sales Chart Effect
  useEffect(() => {
    fetchSalesData(salesPeriod, selectedDate);
  }, [salesPeriod, selectedDate]);

  // Performance Chart Effect
  useEffect(() => {
    fetchPerformanceData(performancePeriod, selectedDate);
  }, [performancePeriod, selectedDate]);

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

      <div className="chart-grid1">
        <div className="sales-calendar-wrapper">
          {/* LEFT SIDE - GRAPH */}
          <div className="sales-card1">
            <div className="card-header1">
              <h2>Sales Overview</h2>
              <div className="time-buttons">
                <button onClick={() => setSalesPeriod("weekly")}>Weekly</button>
                <button onClick={() => setSalesPeriod("monthly")}>
                  Monthly
                </button>
              </div>
            </div>

            <div className="card-body chart-container">
              <canvas id="salesChart"></canvas>
            </div>
          </div>

          {/* RIGHT SIDE - CALENDAR */}
          <div className="card calendar-card">
            <div className="card-header1">Calendar</div>
            <div className="card-body calendar-body">
              <Calendar onChange={setSelectedDate} value={selectedDate} />
            </div>
          </div>
        </div>
      </div>

      {/* TOP PERFORMANCE */}
      <div className="card full-width">
        <div className="card-header1">
          <p>Top 10 Performer ({performancePeriod.toUpperCase()})</p>
          <div className="time-buttons">
            <button onClick={() => setPerformancePeriod("daily")}>Daily</button>
            <button onClick={() => setPerformancePeriod("weekly")}>
              Weekly
            </button>
            <button onClick={() => setPerformancePeriod("monthly")}>
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
