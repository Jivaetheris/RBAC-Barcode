import React, { useEffect, useState } from "react";
import { supabase } from "../../createClient";

const Role = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: roleData, error: roleErr } = await supabase.from("roles").select("*");
    const { data: userData, error: userErr } = await supabase
      .from("users")
      .select(`id, username, role_id, roles (name)`);

    if (roleErr || userErr) {
      console.error("Error loading roles/users:", roleErr || userErr);
    } else {
      setRoles(roleData);
      setUsers(userData);
    }

    setLoading(false);
  };

  const handleRoleChange = async (userId, newRoleId) => {
    const { error } = await supabase.from("users").update({ role_id: newRoleId }).eq("id", userId);

    if (error) {
      console.error("Update error:", error);
      setUpdateMessage("Failed to update role.");
    } else {
      setUpdateMessage("Role updated successfully.");
      fetchData();
    }

    setTimeout(() => setUpdateMessage(""), 3000);
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #ddd",
        maxWidth: "700px",
        margin: "20px auto",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>User Roles Management</h2>

      {updateMessage && (
        <p
          style={{
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            padding: "10px 15px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {updateMessage}
        </p>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#2E8B57", color: "white" }}>
            <th style={thStyle}>Username</th>
            <th style={thStyle}>Current Role</th>
            <th style={thStyle}>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              style={{
                backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
                borderBottom: "1px solid #ddd",
              }}
            >
              <td style={tdStyle}>{user.username}</td>
              <td style={tdStyle}>{user.roles?.name || "Unknown"}</td>
              <td style={tdStyle}>
                <select
                  value={user.role_id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  style={selectStyle}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Adjusted styles
const thStyle = {
  padding: "10px",
  textAlign: "left",
  fontSize: "14px",
  maxWidth: "180px",
};

const tdStyle = {
  padding: "10px",
  fontSize: "14px",
  wordWrap: "break-word",
};

const selectStyle = {
  padding: "6px 10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  fontSize: "14px",
  width: "100%",
  maxWidth: "160px",
};

export default Role;
