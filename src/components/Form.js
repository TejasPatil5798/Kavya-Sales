import { useState, useEffect } from "react";
import API from "../api/api"; // ⭐ use axios instance
import "./Form.css";

const Form = () => {
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

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login as admin first");
      window.location.href = "/login";
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};

    if (!form.fullName || /\d/.test(form.fullName))
      e.fullName = "Enter valid name (letters only)";

    if (!form.email) e.email = "Email is required";

    if (!form.phone || /\D/.test(form.phone))
      e.phone = "Phone must contain digits only";

    if (!form.role) e.role = "Role is required";
    if (!form.team) e.team = "Team is required";

    if (!form.callTarget || form.callTarget < 0)
      e.callTarget = "Positive number required";

    if (!form.monthlyTarget || form.monthlyTarget < 0)
      e.monthlyTarget = "Positive number required";

    if (!form.password) e.password = "Password is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      phoneNumber: form.phone,
      role: form.role,
      callTarget: Number(form.callTarget),
      monthlyTarget: Number(form.monthlyTarget),
      teamAllocation: form.team,
    };

    try {
      await API.post("/users/create", payload);

      setSuccess(true);
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

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Registration failed"));
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2 className="form-title">New User Registration</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} />
            <Field label="Email" name="email" value={form.email} onChange={handleChange} error={errors.email} />
            <Field label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} />

            <SelectField label="Role" name="role" value={form.role} onChange={handleChange} error={errors.role}>
              <option value="">Select Role</option>
              <option value="EMPLOYEE">Employee</option>
            </SelectField>

            <SelectField label="Team Allocation" name="team" value={form.team} onChange={handleChange} error={errors.team}>
              <option value="">Select Team</option>
              <option>Team A</option>
              <option>Team B</option>
              <option>Team C</option>
              <option>Team D</option>
            </SelectField>

            <Field label="Monthly Call Target" name="callTarget" type="number" value={form.callTarget} onChange={handleChange} error={errors.callTarget} />
            <Field label="Monthly Sales Target" name="monthlyTarget" type="number" value={form.monthlyTarget} onChange={handleChange} error={errors.monthlyTarget} />
            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={() => window.history.back()}>
              ← Previous
            </button>
            <button type="submit" className="btn primary">
              Register
            </button>
          </div>
        </form>

        {success && <div className="success-msg">✅ User registered successfully</div>}
      </div>
    </div>
  );
};

/* Reusable Inputs */
const Field = ({ label, error, ...props }) => (
  <div className="field">
    <label>{label}</label>
    <input {...props} className={error ? "error" : ""} />
    {error && <span className="error-text">{error}</span>}
  </div>
);

const SelectField = ({ label, error, children, ...props }) => (
  <div className="field">
    <label>{label}</label>
    <select {...props} className={error ? "error" : ""}>
      {children}
    </select>
    {error && <span className="error-text">{error}</span>}
  </div>
);

export default Form;
