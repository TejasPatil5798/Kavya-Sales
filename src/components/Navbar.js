import { useEffect, useState } from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // ✅ FETCH USER FROM API (always latest)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/users/me");
        setUser(data);
      } catch (err) {
        console.error("Navbar fetch error", err);
      }
    };

    fetchUser();
  }, []);

  const displayName =
    user?.name || user?.fullName || user?.email || "User";

  const firstName = displayName.split(" ")[0];

  const goToProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const goToSettings = () => {
    setOpen(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setOpen(false);
    localStorage.clear();
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <h3 className="welcome-text">
          Hello,
          <span className="welcome-name"> {firstName}</span>
        </h3>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        <div className="profile-wrapper">
          <div
            className="profile"
            onClick={() => setOpen(!open)}
            style={{ cursor: "pointer" }}
          >
            {/* 🔥 PROFILE IMAGE OR ICON */}
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="navbar-avatar"
              />
            ) : (
              <FiUser />
            )}

            <span className="profile-name">{displayName}</span>
          </div>

          {open && (
            <div className="profile-dropdown">
              <button onClick={goToProfile}>
                <FiUser /> My Profile
              </button>

              {role === "admin" && (
                <button onClick={goToSettings}>
                  <FiSettings /> Settings
                </button>
              )}

              <hr />

              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;