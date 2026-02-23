import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import API from "../api/api";
import "./UserDashboard.css";
 
const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <h1>Welcome User</h1>
      <p>You have read-only access.</p>

      <div className="user-cards">
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{tasks.length}</p>
        </div>
 
        <div className="card">
          <h3>Completed Tasks</h3>
          <p>{tasks.filter(t => t.status === "Completed").length}</p>
        </div>
 
        <div className="card">
          <h3>Status</h3>
          <p>Active</p>
        </div>
      </div>
    </div>
  );
};
 
export default UserDashboard;