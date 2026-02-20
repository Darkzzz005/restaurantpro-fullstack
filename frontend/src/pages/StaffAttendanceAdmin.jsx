import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function StaffAttendanceAdmin() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setMsg("");
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("No token found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API}/api/staff/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401) setMsg("Unauthorized. Please login again.");
      else if (status === 403) setMsg("Access denied. Admin only.");
      else setMsg(err?.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <h2 style={{ margin: 0 }}>📌 Staff Attendance</h2>
        <button onClick={fetchAttendance} style={styles.btn}>
          ⟳ Refresh
        </button>
      </div>

      {loading && <div style={styles.msg}>Loading attendance...</div>}

      {msg && <div style={styles.msg}>{msg}</div>}

      {!loading && rows.length === 0 && !msg && (
        <div style={styles.empty}>No attendance records found.</div>
      )}

      {!loading && rows.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Staff</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Check-in</th>
                <th style={styles.th}>Check-out</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td style={styles.td}>{r.date}</td>
                  <td style={styles.td}>
                    {r.staff?.name || r.staff || "-"}
                  </td>
                  <td style={styles.td}>{r.status || "-"}</td>
                  <td style={styles.td}>
                    {r.checkIn
                      ? new Date(r.checkIn).toLocaleString()
                      : "-"}
                  </td>
                  <td style={styles.td}>
                    {r.checkOut
                      ? new Date(r.checkOut).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh" },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },

  btn: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  msg: {
    background: "#1e293b",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  empty: {
    background: "#1e293b",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  tableWrap: {
    background: "#1e293b",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 720,
  },

  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#cbd5e1",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
};
