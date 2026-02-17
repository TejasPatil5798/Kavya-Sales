import { useEffect, useState } from "react";
import { FiUser, FiBell, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const navigate = useNavigate();

  // ✅ LOAD USER NAME SAFELY
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setDisplayName(
          user?.name ||
          user?.fullName ||
          user?.email ||
          "User"
        );
      } catch (error) {
        console.error("Navbar user parse error", error);
        setDisplayName("User");
      }
    }
  }, []);

  // ✅ EXTRACT FIRST NAME ONLY
  const firstName = displayName?.split(" ")[0];

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
      {/* LEFT SIDE */}
      <div className="navbar-left">
        <h3 className="welcome-text">
          Hello,
          <span className="welcome-name"> {firstName}</span>
        </h3>
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">
        <button className="icon-btn">
          <FiBell />
        </button>

        <div className="profile-wrapper">
          <div
            className="profile"
            onClick={() => setOpen(!open)}
            style={{ cursor: "pointer" }}
          >
            <FiUser />
            <span className="profile-name">{displayName}</span>
          </div>

          {open && (
            <div className="profile-dropdown">
              <button onClick={goToProfile}>
                <FiUser /> My Profile
              </button>

              <button onClick={goToSettings}>
                <FiSettings /> Settings
              </button>

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
