import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./login.css";
import API from "../api/api";   // adjust path if needed

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/login", formData);

      const role = (data.role || "user").toLowerCase();
      const userName = data.name || data.fullName || "User";

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", data.email || formData.email);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          fullName: data.fullName || data.name || userName,
          email: data.email || formData.email,
          phone: data.phone || "-",
          role,
          employeeId: data.employeeId || "-",
          department: data.department || "-",
          managerName: data.managerName || "-",
          permissions: data.permissions || "View Only",
          accessLevel: role === "admin" ? "Full Access" : "Limited Access",
        })
      );

      if (onLogin) onLogin();

      navigate(role === "admin" ? "/dashboard" : "/user-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Sales Portal Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
