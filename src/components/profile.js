import { useEffect, useState } from "react";
import { FiUser, FiUpload, FiTrash2 } from "react-icons/fi";
import API from "../api/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [hover, setHover] = useState(false);
  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/users/me");
      setUser(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= UPLOAD HANDLER ================= */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview instantly
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const { data } = await API.put("/users/upload-profile-picture", formData);

      setUser(data.user);
      alert("Profile picture updated successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm("Remove profile picture?")) return;

    try {
      const res = await API.delete("/users/remove-profile-picture");

      setUser(res.data.user);
      setPreview(null);

      alert("Profile picture removed successfully");
    } catch (err) {
      console.error("Remove error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to remove image");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>No profile data</p>;

  const isAdmin = user.role === "admin";

  return (
    <div className="profile-container">
      <h2 style={{ marginBottom: "24px" }}>My Profile</h2>

      <div className="profile-header">
        {/* PROFILE IMAGE */}
        <div className="profile-image-container">
          <div className="profile-wraper1">
            {preview || user.profileImage ? (
              <img
                src={preview || user.profileImage}
                alt="Profile"
                onClick={() => setShowImageModal(true)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #0b1f32",
                  cursor: "zoom-in",
                  transition: "all 0.25s ease",
                  transform: hover ? "scale(1.08)" : "scale(1)",
                  boxShadow: hover
                    ? "0 6px 16px rgba(0,0,0,0.25)"
                    : "0 2px 6px rgba(0,0,0,0.15)",
                }}
              />
            ) : (
              <div
                onClick={() => setShowImageModal(true)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "#0b1f32",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  cursor: "zoom-in",
                  transition: "all 0.25s ease",
                  transform: hover ? "scale(1.08)" : "scale(1)",
                  boxShadow: hover
                    ? "0 6px 16px rgba(0,0,0,0.25)"
                    : "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <FiUser />
              </div>
            )}
          </div>

          <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
            <button
              onClick={() => document.getElementById("profileUpload").click()}
              style={{
                padding: "6px 10px",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <FiUpload size={14} />
              Update
            </button>

            {(preview || user.profileImage) && (
              <button
                onClick={handleRemoveImage}
                style={{
                  padding: "6px 10px",
                  fontSize: "12px",
                  color: "red",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FiTrash2 size={14} />
                Remove
              </button>
            )}
          </div>

          <input
            type="file"
            id="profileUpload"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>

        <div>
          <h3 style={{ margin: 0 }}>{user.name}</h3>
          <p style={{ margin: "4px 0", color: "#64748b" }}>
            {isAdmin ? "System Administrator" : "Employee"}
          </p>
        </div>
      </div>

      <hr style={{ margin: "24px 0" }} />

      <div className="profile-grid">
        <div className="profile-item">
          <strong>Name</strong>
          <p>{user.name}</p>
        </div>

        <div className="profile-item">
          <strong>Contact Number</strong>
          <p>{user.phone || "-"}</p>
        </div>

        <div className="profile-item">
          <strong>Email ID</strong>
          <p>{user.email}</p>
        </div>

        <div className="profile-item">
          <strong>Role</strong>
          <p>{user.role}</p>
        </div>

        {!isAdmin && (
          <div className="profile-item">
            <strong>Team</strong>
            <p>{user.team || "-"}</p>
          </div>
        )}
      </div>

      {showImageModal && (preview || user.profileImage) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowImageModal(false)}
        >
          <img
            src={preview || user.profileImage}
            alt="Profile"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "400px",
              maxHeight: "400px",
              borderRadius: "10px",
              background: "#fff",
              padding: "10px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;
