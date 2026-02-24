import { useEffect, useState } from "react";
import "./UserProfile.css";
import API from "../api/api";
import { FiUser, FiCamera } from "react-icons/fi";

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [preview, setPreview] = useState(null);

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
      const { data } = await API.put(
        "/users/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUser(data.user);
      alert("Profile picture updated successfully");
    } catch (err) {
      console.error("Upload failed", err);
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* PROFILE IMAGE */}
          <div style={{ position: "relative" }}>
            <label htmlFor="profileUpload" style={{ cursor: "pointer" }}>
              {preview || user.profileImage ? (
                <img
                  src={preview || user.profileImage}
                  alt="Profile"
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #0b1f32",
                  }}
                />
              ) : (
                <div
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
                  }}
                >
                  <FiUser />
                </div>
              )}
            </label>

            {/* CAMERA ICON PERFECTLY PLACED */}
            <label
              htmlFor="profileUpload"
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                background: "#ffffff",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              <FiCamera size={14} />
            </label>

            <input
              type="file"
              id="profileUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <div>
            <h4 style={{ margin: 0 }}>{user.name || "User"}</h4>
            <p style={{ margin: "4px 0", color: "#64748b" }}>Employee Access</p>
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
