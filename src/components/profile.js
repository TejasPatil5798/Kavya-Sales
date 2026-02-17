import { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile");

      setUser(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

      {/* PROFILE HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#0b1f32",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
          }}
        >
          <FiUser />
        </div>

        <div>
          <h3 style={{ margin: 0 }}>{user.fullName}</h3>
          <p style={{ margin: "4px 0", color: "#64748b" }}>
            {isAdmin ? "System Administrator" : "Employee"}
          </p>
        </div>
      </div>

      <hr style={{ margin: "24px 0" }} />

      {/* COMMON FIELDS */}
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
          <p>{user.fullName || user.name}</p>
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

        {/* ADMIN ONLY FIELDS */}
        {isAdmin && (
          <>
            <div>
              <strong>Admin Level</strong>
              <p>{user.adminLevel || "Full Access"}</p>
            </div>

            <div>
              <strong>Permissions</strong>
              <p>All System Permissions</p>
            </div>
          </>
        )}

        {/* EMPLOYEE ONLY FIELDS */}
        {!isAdmin && (
          <>
            <div>
              <strong>Employee ID</strong>
              <p>{user.employeeId || "-"}</p>
            </div>

            <div>
              <strong>Department</strong>
              <p>{user.department || "-"}</p>
            </div>

            <div>
              <strong>Manager</strong>
              <p>{user.managerName || "-"}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
