import { useEffect, useState } from "react";
import "./UserProfile.css";
import API from "../api/api";
import { FiUser } from "react-icons/fi";

const UserProfile = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/me");
        setUser(data || {});
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    fetchProfile();
  }, []);


  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>

        <div className="profile-header">
          <div className="profile-avatar">
            <FiUser size={28} />
          </div>

          <div className="profile-role">
            <h4>{user.name || "User"}</h4>
            <p>Employee Access</p>
          </div>
        </div>

        <hr />

        <div className="profile-grid">
          <div>
            <label>Name</label>
            <p>{user.name || "—"}</p>
          </div>

          <div>
            <label>Contact Number</label>
            <p>{user.phone || "—"}</p>
          </div>

          <div>
            <label>Email ID</label>
            <p>{user.email || "—"}</p>
          </div>

          <div>
            <label>Role</label>
            <p>{user.role || "user"}</p>
          </div>

          <div>
            <label>Team</label>
            <p>{user.team || "—"}</p>
          </div>


          <div>
            <label>Access Level</label>
            <p>Limited Access</p>
          </div>

          <div>
            <label>Permissions</label>
            <p>View Only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
