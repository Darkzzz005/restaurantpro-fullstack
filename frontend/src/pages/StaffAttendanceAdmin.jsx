import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

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
    <Layout>
      <div style={styles.page}>
        <div style={styles.top}>
          <div>
            <h2 style={styles.heading}> Staff Attendance</h2>
            <p style={styles.subText}>
              View daily attendance records, check-in, and check-out history.
            </p>
          </div>

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
                    <td style={styles.td}>{r.staff?.name || r.staff || "-"}</td>
                    <td style={styles.td}>{r.status || "-"}</td>
                    <td style={styles.td}>
                      {r.checkIn ? new Date(r.checkIn).toLocaleString() : "-"}
                    </td>
                    <td style={styles.td}>
                      {r.checkOut ? new Date(r.checkOut).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    color: "#2c2c2c",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
    flexWrap: "wrap",
  },

  heading: {
    margin: 0,
    fontSize: "42px",
    fontWeight: 800,
    color: "#2c2c2c",
  },

  subText: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#7a6f5d",
    fontSize: "15px",
  },

  btn: {
    background: "#243042",
    border: "none",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  msg: {
    background: "#f5efe4",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    border: "1px solid #e6d8c4",
    color: "#5f5448",
    fontWeight: 600,
  },

  empty: {
    background: "#fffaf3",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #e6d8c4",
    color: "#6b5d4d",
    fontWeight: 600,
  },

  tableWrap: {
    background: "#fffaf3",
    borderRadius: 16,
    border: "1px solid #e6d8c4",
    overflow: "auto",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 720,
  },

  th: {
    textAlign: "left",
    padding: 14,
    borderBottom: "1px solid #e6d8c4",
    color: "#7a6f5d",
    fontWeight: 800,
    background: "#f8f1e7",
  },

  td: {
    padding: 14,
    borderBottom: "1px solid #efe3d3",
    color: "#2c2c2c",
  },
};