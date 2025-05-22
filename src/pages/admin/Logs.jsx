import { useEffect, useState } from "react";
import { supabase } from "../../createClient";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [tableFilter]);

  const fetchLogs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Failed to fetch activity logs:", error.message);
    } else {
      const filtered =
        tableFilter === "all"
          ? data
          : data.filter((log) => log.table_name === tableFilter);
      setLogs(filtered);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxHeight: "75vh",
        overflowY: "auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #ddd",
        minWidth: "400px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
          Activity Logs
        </h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "0.9rem",
            }}
          >
            <option value="all">All Tables</option>
            <option value="stock_entries">Stock Entries</option>
            <option value="stock_transfers">Stock Transfers</option>
            <option value="products">Products</option>
            <option value="warehouses">Warehouses</option>
            {/* Add more options here */}
          </select>

          <button
            onClick={fetchLogs}
            style={{
              backgroundColor: "#2E8B57",
              color: "white",
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#276746")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#2E8B57")
            }
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#888", animation: "pulse 1.5s infinite" }}>
          Loading logs...
        </p>
      ) : logs.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center" }}>No logs found.</p>
      ) : (
        <table
          width="100%"
          style={{ borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }}
        >
          <thead style={{ backgroundColor: "#2E8B57", color: "white" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left" }}>Action</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Table Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Record ID</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Details</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
          {logs.map((log, index) => (
            <tr
              key={log.id}
              style={{
                borderBottom: "1px solid #ddd",
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
              }}
            >
              <td style={{ padding: "10px" }}>{log.action}</td>
              <td style={{ padding: "10px" }}>{log.table_name}</td>
              <td style={{ padding: "10px", color: "#555", fontWeight: "bold" }}>
                {log.record_id || "—"}
              </td>
              <td
                style={{
                  padding: "10px",
                  maxWidth: "300px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  color: "#444",
                }}
              >
                {JSON.stringify(log.details, null, 2)}
              </td>
              <td style={{ padding: "10px", whiteSpace: "nowrap", color: "#777" }}>
                {new Date(log.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}
