import { useEffect, useState } from "react";
import "./UserProfile.css";
import API from "../api/api";
import { FiUser, FiCamera, FiTrash2 } from "react-icons/fi";

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [preview, setPreview] = useState(null);
  const [hover, setHover] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

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

  /* ================= IMAGE UPLOAD ================= */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // instant preview
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const { data } = await API.put("/users/upload-profile-picture", formData);

      setUser(data.user);
      alert("Profile picture updated successfully");
    } catch (err) {
      console.error("Upload failed", err);
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm("Remove profile picture?")) return;

    try {
      const res = await API.delete("/users/remove-profile-picture");

      setUser(res.data.user);
      setPreview(null);

      alert("Profile picture removed");
    } catch (err) {
      console.error(err);
      alert("Failed to remove image");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>

        <div className="profile-header">
          {/* PROFILE IMAGE */}
          <div className="profile-image-wrapper">
            <label htmlFor="profileUpload" className="profile-image-label">
              {preview || user.profileImage ? (
                <img
                  src={preview || user.profileImage}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-placeholder">
                  <FiUser />
                </div>
              )}
            </label>

            <label htmlFor="profileUpload" className="camera-icon">
              <FiCamera size={14} />
            </label>

            <input
              type="file"
              id="profileUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            {/* BUTTONS */}
            <div className="profile-buttons">
              <button className="update-btn">Update</button>
              <button className="remove-btn" onClick={handleRemoveImage}>
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>

          {/* USER INFO */}
          <div className="profile-user-info">
            <h3>{user.name || "User"}</h3>
            <p className="user-role">System Administrator</p>
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
            <p>{user.role || "employee"}</p>
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
