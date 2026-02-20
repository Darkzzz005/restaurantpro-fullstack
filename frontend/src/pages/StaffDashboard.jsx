import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function StaffDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    const [tasksRes] = await Promise.all([
      api.get("/api/staff/my/tasks"),
    ]);
    setTasks(tasksRes.data || []);
  };

  useEffect(() => {
    load().catch((e) => setMsg(e?.response?.data?.message || "Failed to load staff data"));
    // eslint-disable-next-line
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const updateStatus = async (taskId, status) => {
    setMsg("");
    try {
      await api.patch(`/api/staff/my/tasks/${taskId}/status`, { status });
      setMsg("✅ Task updated!");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to update task");
    }
  };

  const checkIn = async () => {
  setMsg("");
  try {
    const res = await api.post("/api/staff/my/attendance/check-in"); 
    setAttendance(res.data);
    setMsg("✅ Checked in!");
  } catch (e) {
    setMsg(e?.response?.data?.message || "Check-in failed");
  }
};

const checkOut = async () => {
  setMsg("");
  try {
    const res = await api.post("/api/staff/my/attendance/check-out"); 
    setAttendance(res.data);
    setMsg("✅ Checked out!");
  } catch (e) {
    setMsg(e?.response?.data?.message || "Check-out failed");
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>RestaurantPro</h1>
          <p style={styles.sub}>Staff Dashboard{user?.name ? ` • ${user.name}` : ""}</p>
        </div>
        <button onClick={logout} style={styles.logout}>Logout</button>
      </div>

      {msg && <div style={styles.msg}>{msg}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Attendance</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button style={styles.primaryBtn} onClick={checkIn}>Check In</button>
            <button style={styles.primaryBtn} onClick={checkOut}>Check Out</button>
          </div>

          {attendance ? (
            <div style={styles.small}>
              <div><b>Date:</b> {attendance.date}</div>
              <div><b>CheckIn:</b> {attendance.checkIn ? new Date(attendance.checkIn).toLocaleString() : "-"}</div>
              <div><b>CheckOut:</b> {attendance.checkOut ? new Date(attendance.checkOut).toLocaleString() : "-"}</div>
              <div><b>Status:</b> {attendance.status}</div>
            </div>
          ) : (
            <p style={styles.small}>Click Check In to create today’s attendance.</p>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>My Tasks</h3>
          {tasks.length === 0 ? (
            <p style={styles.small}>No tasks assigned yet.</p>
          ) : (
            <div style={styles.list}>
              {tasks.map((t) => (
                <div key={t._id} style={styles.row}>
                  <div>
                    <b>{t.title}</b>
                    <div style={styles.small}>
                      {t.priority} • {t.status}
                      {t.dueDate ? ` • Due: ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                    </div>
                    {t.description && <div style={styles.small}>{t.description}</div>}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={styles.smallBtn} onClick={() => updateStatus(t._id, "In Progress")}>
                      In Progress
                    </button>
                    <button style={styles.primaryBtn} onClick={() => updateStatus(t._id, "Completed")}>
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h3 style={styles.cardTitle}>Tip</h3>
          <p style={styles.small}>
            Admin assigns tasks from backend: <b>/api/staff/tasks</b>. Staff sees them here.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#0f172a", color: "white", padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { margin: 0, fontSize: 28 },
  sub: { margin: "6px 0 0", color: "#94a3b8" },
  logout: { background: "#ef4444", color: "white", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer" },
  msg: { background: "#1e293b", padding: 12, borderRadius: 10, marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: { background: "#1e293b", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" },
  cardTitle: { marginTop: 0, marginBottom: 12 },
  list: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflow: "auto" },
  row: { display: "flex", justifyContent: "space-between", gap: 10, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.04)" },
  small: { color: "#cbd5e1", fontSize: 13, marginTop: 4 },
  primaryBtn: { background: "#3b82f6", color: "white", border: "none", padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  smallBtn: { background: "rgba(59,130,246,0.15)", color: "white", border: "1px solid rgba(59,130,246,0.35)", padding: "8px 10px", borderRadius: 8, cursor: "pointer" },
};

export default StaffDashboard;
