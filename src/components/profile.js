import { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import API from "../api/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

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
    <div
      style={{
        width: "100%",
        background: "#ffffff",
        padding: "32px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginBottom: "24px" }}>My Profile</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* PROFILE IMAGE */}
        <div style={{ position: "relative" }}>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => setShowImageModal(true)}
          >
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
          </div>

          <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
            <button
              onClick={() => document.getElementById("profileUpload").click()}
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Update
            </button>

            {(preview || user.profileImage) && (
              <button
                onClick={handleRemoveImage}
                style={{
                  padding: "4px 10px",
                  fontSize: "12px",
                  color: "red",
                  cursor: "pointer",
                }}
              >
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          columnGap: "32px",
          rowGap: "16px",
        }}
      >
        <div>
          <strong>Name</strong>
          <p>{user.name}</p>
        </div>

        <div>
          <strong>Contact Number</strong>
          <p>{user.phone || "-"}</p>
        </div>

        <div>
          <strong>Email ID</strong>
          <p>{user.email}</p>
        </div>

        <div>
          <strong>Role</strong>
          <p>{user.role}</p>
        </div>

        {!isAdmin && (
          <>
            <div>
              <strong>Team</strong>
              <p>{user.team || "-"}</p>
            </div>
          </>
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
