import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiClipboard,
  FiLayers,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiCheckSquare,
  FiMenu,
  FiX,
} from "react-icons/fi";
import "./Sidebar.css";

const AdminSidebar = ({
  onLogout,
  isOpen,
  toggleSidebar,
  closeSidebar,
}) => {
  const linkClass = ({ isActive }) =>
    isActive ? "menu-item active" : "menu-item";

  return (
    <>
      {/* 🔘 TOGGLE BUTTON (Mobile Only) */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* 🌑 OVERLAY */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={closeSidebar}
      />

      {/* 📦 SIDEBAR */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src="/Images/A1.png" alt="Logo" className="sidebar-logo" />
        </div>

        <nav className="sidebar-menu" onClick={closeSidebar}>
          <NavLink to="/dashboard" className={linkClass}>
            <FiHome /> Dashboard
          </NavLink>

          <NavLink to="/employees" className={linkClass}>
            <FiUsers /> Employees
          </NavLink>

          <NavLink to="/register-user" className={linkClass}>
            <FiFileText /> Register User
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

          <NavLink to="/tasks" className={linkClass}>
            <FiCheckSquare /> Tasks
          </NavLink>

          <NavLink to="/settings" className={linkClass}>
            <FiSettings /> Settings
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

export default AdminSidebar;
