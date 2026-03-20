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
            <h2 style={styles.heading}> Staff Management</h2>
            <p style={styles.sub}>View staff list, assign tasks, and check attendance</p>
          </div>

          <div style={styles.topActions}>

            <button
              onClick={() => navigate("/staff-admin/attendance")}
              style={styles.primaryBtn2}
            >
               Attendance
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
                <div style={styles.topRow}>
                  <div style={styles.avatar}>
                    {s.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={styles.name}>{s.name}</div>
                    <div style={styles.small}>{s.email}</div>
                  </div>

                  <div style={styles.role}>{s.role}</div>
                </div>

                <div style={styles.info}>
                  <span style={styles.infoLabel}>ID</span>
                  <span style={styles.infoValue}>{s._id}</span>
                </div>

                <div style={styles.actions}>
                  <button
                    style={styles.assignBtn}
                    onClick={() => navigate("/staff-admin/assign")}
                  >
                    Assign Task
                  </button>
                </div>
              </div>
            ))}
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

  heading: {
    margin: 0,
    fontSize: "42px",
    fontWeight: 800,
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

  sub: {
    margin: "6px 0 0",
    color: "#8c7b65",
    fontSize: 14,
  },

  topActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  btn: {
    background: "#243042",
    border: "none",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },

  primaryBtn: {
    background: "#3b82f6",
    border: "none",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },

  primaryBtn2: {
    background: "#dff3e2",
    border: "1px solid #9ad3a4",
    color: "#225c2e",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },

  msg: {
    background: "#f5efe4",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    border: "1px solid #e6d8c4",
  },

  empty: {
    background: "#f5efe4",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #e6d8c4",
    color: "#5f5448",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
  },

  card: {
    background: "#fffaf3",
    border: "1px solid #e6d8c4",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#b08968",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: 18,
    flexShrink: 0,
  },

  name: {
    fontSize: 18,
    fontWeight: 900,
    color: "#2c2c2c",
  },

  small: {
    fontSize: 13,
    color: "#6b5d4d",
    marginTop: 4,
  },

  role: {
    background: "#efe3cf",
    color: "#5a4630",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "capitalize",
  },

  info: {
    marginTop: 14,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: "#8a7b65",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },

  infoValue: {
    fontSize: 12,
    color: "#6b5d4d",
    wordBreak: "break-all",
  },

  actions: {
    marginTop: 16,
  },

  assignBtn: {
    background: "#b08968",
    border: "none",
    color: "white",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
};