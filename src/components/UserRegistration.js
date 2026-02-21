import { useState, useEffect } from "react";
import API from "../api/api";
import "./UserRegistration.css";

const COMPANY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@kavyainfoweb\.com$/i;

/* ================= REUSABLE COMPONENTS (MUST BE ON TOP) ================= */
const Input = ({ label, error, ...props }) => (
  <div className="field">
    <label>{label}</label>
    <input {...props} className={error ? "error" : ""} />
    {error && <span>{error}</span>}
  </div>
);

const Select = ({ label, error, children, ...props }) => (
  <div className="field">
    <label>{label}</label>
    <select {...props} className={error ? "error" : ""}>
      {children}
    </select>
    {error && <span>{error}</span>}
  </div>
);
/* ====================================================================== */

const UserRegistration = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    team: "",
    callTarget: "",
    monthlyTarget: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 Admin auth check
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      alert("Access denied. Admin login required.");
      window.location.href = "/login";
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    const e = {};

    // ✅ Name Validation
    if (!form.fullName.trim()) {
      e.fullName = "Full Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.fullName)) {
      e.fullName = "Name must contain only characters";
    }

    // ✅ Email Validation
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!COMPANY_EMAIL_REGEX.test(form.email)) {
      e.email = "Email must end with @kavyainfoweb.com";
    }

    // ✅ Phone Validation
    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      e.phone = "Phone must be exactly 10 digits";
    }

    // ✅ Password Validation
    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    // ✅ Role Required
    if (!form.role) {
      e.role = "Role is required";
    }

    // ✅ Employee Specific Validation
    if (form.role === "employee") {
      if (!form.team) e.team = "Team is required";

      if (!form.callTarget || Number(form.callTarget) <= 0)
        e.callTarget = "Monthly Call Target must be greater than 0";

      if (!form.monthlyTarget || Number(form.monthlyTarget) <= 0)
        e.monthlyTarget = "Monthly Sales Target must be greater than 0";
    }

    setErrors(e);

    // 🔴 Popup error if any validation fails
    if (Object.keys(e).length > 0) {
      alert("Please fix all mandatory fields before submitting.");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("authToken");

    const payload = {
      name: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role,
      phone: form.phone,
    };

    if (form.role === "employee") {
      payload.team = form.team;
      payload.monthlyCallTarget = Number(form.callTarget);
      payload.monthlySalesTarget = Number(form.monthlyTarget);
    }

    try {
      await API.post("/users/create", payload);

      setSuccess(true);
      setErrors({});
      setForm({
        fullName: "",
        email: "",
        phone: "",
        role: "",
        team: "",
        callTarget: "",
        monthlyTarget: "",
        password: "",
      });
      setShowPassword(false);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to register user";

      // Detect whether error is for phone or email
      if (message.toLowerCase().includes("phone")) {
        setErrors({ phone: message });
      } else if (message.toLowerCase().includes("email")) {
        setErrors({ email: message });
      } else {
        alert(message);
      }

      setSuccess(false);
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-card">
        <div className="reg-header">New User Registration</div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="reg-grid">
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                setForm({ ...form, fullName: value });
              }}
              error={errors.fullName}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, email: value });

                if (value && !COMPANY_EMAIL_REGEX.test(value)) {
                  setErrors({
                    ...errors,
                    email: "Email must end with @kavyainfoweb.com",
                  });
                } else {
                  setErrors({
                    ...errors,
                    email: "",
                  });
                }
              }}
              error={errors.email}
            />

            <Input
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm({ ...form, phone: value });
              }}
              error={errors.phone}
            />

            <Select
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              error={errors.role}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </Select>

            {form.role === "employee" && (
              <>
                <Select
                  label="Team Allocation"
                  name="team"
                  value={form.team}
                  onChange={handleChange}
                  error={errors.team}
                >
                  <option value="">Select Team</option>
                  <option>Team A</option>
                  <option>Team B</option>
                  <option>Team C</option>
                </Select>

                <Input
                  label="Monthly Call Target"
                  name="callTarget"
                  type="number"
                  value={form.callTarget}
                  onChange={handleChange}
                  error={errors.callTarget}
                />
                <Input
                  label="Monthly Sales Target"
                  name="monthlyTarget"
                  type="number"
                  value={form.monthlyTarget}
                  onChange={handleChange}
                  error={errors.monthlyTarget}
                />
              </>
            )}

            {/* 🔐 PASSWORD WITH EYE ICON */}
            <div className="field">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              {errors.password && <span>{errors.password}</span>}
            </div>
          </div>

          <div className="reg-actions">
            <button type="button" onClick={() => window.history.back()}>
              ← Previous
            </button>
            <button type="submit" className="sdd">
              Register
            </button>
          </div>
        </form>

        {success && (
          <div className="success-box">✅ User created successfully</div>
        )}
      </div>
    </div>
  );
};

export default UserRegistration;
