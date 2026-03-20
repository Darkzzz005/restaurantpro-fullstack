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
    const [tasksRes] = await Promise.all([api.get("/api/staff/my/tasks")]);
    setTasks(tasksRes.data || []);
  };

  useEffect(() => {
    load().catch((e) =>
      setMsg(e?.response?.data?.message || "Failed to load staff data")
    );
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
          <p style={styles.sub}>
            Staff Dashboard{user?.name ? ` • ${user.name}` : ""}
          </p>
        </div>
        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>

      {msg && <div style={styles.msg}>{msg}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Attendance</h3>

          <div style={styles.buttonRow}>
            <button style={styles.primaryBtn} onClick={checkIn}>
              Check In
            </button>
            <button style={styles.secondaryBtn} onClick={checkOut}>
              Check Out
            </button>
          </div>

          {attendance ? (
            <div style={styles.infoBox}>
              <div>
                <b>Date:</b> {attendance.date}
              </div>
              <div>
                <b>Check In:</b>{" "}
                {attendance.checkIn
                  ? new Date(attendance.checkIn).toLocaleString()
                  : "-"}
              </div>
              <div>
                <b>Check Out:</b>{" "}
                {attendance.checkOut
                  ? new Date(attendance.checkOut).toLocaleString()
                  : "-"}
              </div>
              <div>
                <b>Status:</b> {attendance.status}
              </div>
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
                  <div style={{ flex: 1 }}>
                    <b style={styles.taskTitle}>{t.title}</b>

                    <div style={styles.small}>
                      {t.priority} • {t.status}
                      {t.dueDate
                        ? ` • Due: ${new Date(t.dueDate).toLocaleDateString()}`
                        : ""}
                    </div>

                    {t.description && (
                      <div style={styles.small}>{t.description}</div>
                    )}
                  </div>

                  <div style={styles.taskActions}>
                    <button
                      style={styles.smallBtn}
                      onClick={() => updateStatus(t._id, "In Progress")}
                    >
                      In Progress
                    </button>
                    <button
                      style={styles.primaryBtn}
                      onClick={() => updateStatus(t._id, "Completed")}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f7f3ea",
    color: "#2c2c2c",
    padding: 24,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    gap: 16,
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#2c2c2c",
  },

  sub: {
    margin: "6px 0 0",
    color: "#7a6f5d",
    fontSize: 15,
  },

  logout: {
    background: "#d9534f",
    color: "white",
    border: "none",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 18,
  },

  card: {
    background: "#fffaf3",
    padding: 18,
    borderRadius: 16,
    border: "1px solid #e6d8c4",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: 14,
    color: "#2c2c2c",
    fontSize: 24,
    fontWeight: 800,
  },

  buttonRow: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
  },

  infoBox: {
    background: "#f7efe3",
    border: "1px solid #e6d8c4",
    padding: 14,
    borderRadius: 12,
    color: "#5f5448",
    lineHeight: 1.8,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: 360,
    overflow: "auto",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    background: "#f7efe3",
    border: "1px solid #e6d8c4",
    flexWrap: "wrap",
  },

  taskTitle: {
    color: "#2c2c2c",
    fontSize: 16,
  },

  small: {
    color: "#6b5d4d",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 1.5,
  },

  taskActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  primaryBtn: {
    background: "#b08968",
    color: "white",
    border: "none",
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryBtn: {
    background: "#e7d7c2",
    color: "#5a4630",
    border: "1px solid #d8c7b0",
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  smallBtn: {
    background: "#efe3cf",
    color: "#5a4630",
    border: "1px solid #d8c7b0",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default StaffDashboard;