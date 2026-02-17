import "./UserDashboard.css";

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <h1>Welcome User</h1>
      <p>You have read-only access.</p>

      <div className="user-cards">
        <div className="card">
          <h3>Assigned Projects</h3>
          <p>5</p>
        </div>

        <div className="card">
          <h3>Pending Tasks</h3>
          <p>12</p>
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
