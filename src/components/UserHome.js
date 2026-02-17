import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./UserHome.css";

const UserHome = () => {
  const activityChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  useEffect(() => {
    const activityCtx = document.getElementById("activityChart");
    const performanceCtx = document.getElementById("userPerformanceChart");

    // Destroy old charts
    if (activityChartRef.current) activityChartRef.current.destroy();
    if (performanceChartRef.current) performanceChartRef.current.destroy();

    // USER ACTIVITY CHART
    if (activityCtx) {
      activityChartRef.current = new Chart(activityCtx, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [
            {
              label: "Tasks Completed",
              data: [3, 5, 4, 6, 7, 5],
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

    // USER PERFORMANCE CHART
    if (performanceCtx) {
      performanceChartRef.current = new Chart(performanceCtx, {
        type: "bar",
        data: {
          labels: ["Leads", "Intake", "Resources"],
          datasets: [
            {
              label: "Your Performance",
              data: [85, 72, 90],
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
          <h3>42</h3>
        </div>

        <div className="kpi-card blue">
          <h2>Pending Tasks</h2>
          <h3>8</h3>
        </div>

        <div className="kpi-card lavender">
          <h2>Performance Score</h2>
          <h3>82%</h3>
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
