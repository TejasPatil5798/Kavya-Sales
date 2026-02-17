import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

/* LAYOUT */
import RoleSidebar from "./components/RoleSidebar";
import Navbar from "./components/Navbar";

/* AUTH */
import Login from "./components/login";

/* ADMIN PAGES */
import Dashboard from "./components/dashboard";
import Profile from "./components/profile";
import ProjectLead from "./components/ProjectLead";          // ADMIN
import ProjectIntake from "./components/ProjectIntake";      // ADMIN
import ResourceAllocation from "./components/ResourceAllocation";
import Form from "./components/Form";
import Settings from "./components/settings";
import UserProfile from "./components/UserProfile";
import UserResourceAllocation from "./components/UserResourceAllocation";
import UserRegistration from "./components/UserRegistration";
import Employees from "./components/Employees";
import Tasks from "./components/Tasks";

/* USER PAGES */
import UserHome from "./components/UserHome";
import UserProjectLead from "./components/UserProjectLead";       // USER (READ ONLY)
import UserProjectIntake from "./components/UserProjectIntake";   // USER (READ ONLY)
import MyTasks from "./components/MyTasks";
import "./layout.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );

  const role = localStorage.getItem("role"); // admin | user | employee

  useEffect(() => {
    const onStorage = () => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <>
      {/* SIDEBAR & NAVBAR */}
      {isAuthenticated && <RoleSidebar onLogout={handleLogout} />}
      {isAuthenticated && <Navbar onLogout={handleLogout} />}

      {/* MAIN CONTENT */}
      <div className={`main-content ${isAuthenticated ? "auth" : ""}`}>
        <Routes>
          {/* ================= LOGIN ================= */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate
                  to={role === "admin" ? "/dashboard" : "/user-dashboard"}
                />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {/* BLOCK UNAUTHENTICATED USERS */}
          {!isAuthenticated && (
            <Route path="*" element={<Navigate to="/login" />} />
          )}

          {/* ================= AUTHENTICATED ROUTES ================= */}
          {isAuthenticated && (
            <>
              {/* ROOT REDIRECT */}
              <Route
                path="/"
                element={
                  <Navigate
                    to={role === "admin" ? "/dashboard" : "/user-dashboard"}
                  />
                }
              />

              {/* ================= ADMIN ROUTES ================= */}
              {role === "admin" && (
                <>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route path="/employees" element={<Employees />} />
                  <Route
                    path="/register-user"
                    element={<UserRegistration />}
                  />

                  {/* ADMIN LEADS & INTAKE */}
                  <Route path="/project-leads" element={<ProjectLead />} />
                  <Route path="/project-intake" element={<ProjectIntake />} />

                  <Route
                    path="/resource-allocation"
                    element={<ResourceAllocation />}
                  />
                  {/* ✅ NEW TASKS ROUTE */}
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/forms" element={<Form />} />
                  <Route path="/settings" element={<Settings />} />
                </>
              )}

              {/* ================= USER ROUTES ================= */}
              {role !== "admin" && (
                <>
                  {/* USER DASHBOARD */}
                  <Route path="/user-dashboard" element={<UserHome />} />

                  <Route path="/my-tasks" element={<MyTasks />} />

                  {/* USER READ-ONLY PAGES */}
                  <Route
                    path="/project-leads"
                    element={<UserProjectLead />}
                  />
                  <Route
                    path="/project-intake"
                    element={<UserProjectIntake />}
                  />

                  <Route
                    path="/resource-allocation"
                    element={<UserResourceAllocation />}
                  />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}

              {/* FALLBACK */}
              <Route
                path="*"
                element={
                  <Navigate
                    to={role === "admin" ? "/dashboard" : "/user-dashboard"}
                  />
                }
              />
            </>
          )}
        </Routes>
      </div>
    </>
  );
}

export default App;
