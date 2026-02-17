import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./settings.css";

const Settings = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        "http://localhost:5000/api/password/change",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Password updated successfully");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      alert(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h2>Change Password</h2>

        <form onSubmit={handleSubmit}>
          {/* CURRENT PASSWORD */}
          <div className="password-field">
            <input
              type={show.current ? "text" : "password"}
              name="currentPassword"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
            <span
              className="eye-icon"
              onClick={() =>
                setShow({ ...show, current: !show.current })
              }
            >
              {show.current ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {/* NEW PASSWORD */}
          <div className="password-field">
            <input
              type={show.new ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShow({ ...show, new: !show.new })}
            >
              {show.new ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="password-field">
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span
              className="eye-icon"
              onClick={() =>
                setShow({ ...show, confirm: !show.confirm })
              }
            >
              {show.confirm ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
