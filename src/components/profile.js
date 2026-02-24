import { useEffect, useState } from "react";
import { FiUser, FiCamera } from "react-icons/fi";
import API from "../api/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

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
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
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

          {/* CAMERA ICON */}
          <label
            htmlFor="profileUpload"
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              background: "#ffffff",
              borderRadius: "50%",
              padding: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
          >
            <FiCamera size={16} />
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
    </div>
  );
};

export default Profile;
