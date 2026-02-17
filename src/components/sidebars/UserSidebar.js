import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiHome,
  FiUserCheck,
  FiClipboard,
  FiLayers,
  FiCheckSquare,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";
import "./Sidebar.css";

const UserSidebar = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }) =>
    isActive ? "menu-item active" : "menu-item";

  return (
    <>
      {/* HAMBURGER */}
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        <FiMenu />
      </button>

      {/* OVERLAY */}
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src="/Images/A1.png" alt="Logo" className="sidebar-logo" />
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/user-dashboard" className={linkClass}>
            <FiHome /> Dashboard
          </NavLink>

          <NavLink to="/project-leads" className={linkClass}>
            <FiUserCheck /> Project Lead
          </NavLink>

          <NavLink to="/project-intake" className={linkClass}>
            <FiClipboard /> Project Intake
          </NavLink>

          <NavLink to="/resource-allocation" className={linkClass}>
            <FiLayers /> Resource Allocation
          </NavLink>

          <NavLink to="/my-tasks" className={linkClass}>
            <FiCheckSquare /> My Tasks
          </NavLink>
        </nav>
        

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
