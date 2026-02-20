import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function StaffAdmin() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [msg, setMsg] = useState("");

  const fetchStaff = async () => {
    setMsg("");

    const token = localStorage.getItem("token");

    // Avoid blank page / silent failures
    if (!token) {
      setMsg("Not logged in. Please login as admin first.");
      return;
    }

    const auth = { headers: { Authorization: `Bearer ${token}` } };

    try {
      
      const res = await axios.get(`${API}/api/staff`, auth);
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("STAFF LOAD ERROR:", err);

      const status = err?.response?.status;
      if (status === 401) setMsg("Unauthorized (token missing/expired). Please login again.");
      else if (status === 403) setMsg("Access denied. Admin only.");
      else if (status === 404) setMsg("Staff API not found. Check backend staff routes.");
      else setMsg(err?.response?.data?.message || "Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchStaff();

  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.top}>
          <div>
            <h2 style={{ margin: 0 }}>👥 Staff Management</h2>
            <p style={styles.sub}>View staff list, assign tasks, and check attendance</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/staff-admin/assign")} style={styles.primaryBtn}>
              ➕ Assign Work
            </button>
            <button onClick={() => navigate("/staff-admin/attendance")} style={styles.primaryBtn2}>
              🕒 Attendance
            </button>
            <button onClick={fetchStaff} style={styles.btn}>
              ⟳ Refresh
            </button>
          </div>
        </div>

        {msg && <div style={styles.msg}>{msg}</div>}

        {staff.length === 0 ? (
          <div style={styles.empty}>No staff found.</div>
        ) : (
          <div style={styles.grid}>
            {staff.map((s) => (
              <div key={s._id} style={styles.card}>
                <div style={styles.name}>{s.name}</div>
                <div style={styles.small}>📧 {s.email}</div>
                <div style={styles.badge}>Role: {s.role}</div>
                <div style={styles.id}>ID: {s._id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  page: { minHeight: "100vh" },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  sub: { margin: "6px 0 0", color: "#94a3b8", fontSize: 13 },
  btn: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  primaryBtn: {
    background: "#2563eb",
    border: "none",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },
  primaryBtn2: {
    background: "rgba(34,197,94,0.18)",
    border: "1px solid rgba(34,197,94,0.35)",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14,
  },
  card: {
    background: "#1e293b",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  name: { fontSize: 18, fontWeight: 900, marginBottom: 6 },
  small: { color: "#cbd5e1", fontSize: 13, marginTop: 4 },
  badge: {
    marginTop: 10,
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.35)",
    fontWeight: 900,
    fontSize: 12,
  },
  id: { marginTop: 10, color: "#94a3b8", fontSize: 12, wordBreak: "break-all" },
};
