import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

export default function StaffAssignTaskAdmin() {
  const [staffList, setStaffList] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [staffId, setStaffId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("High");
  const [dueDate, setDueDate] = useState("");

  const getToken = () => localStorage.getItem("token");

  const load = async () => {
    setMsg("");
    setLoading(true);

    const token = getToken();
    if (!token) {
      setMsg("No token found. Please login again.");
      setLoading(false);
      return;
    }

    const auth = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const s = await axios.get(`${API}/api/staff`, auth);
      setStaffList(Array.isArray(s.data) ? s.data : []);

      const t = await axios.get(`${API}/api/staff/all-tasks`, auth);
      setTasks(Array.isArray(t.data) ? t.data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setMsg("Unauthorized. Please login again.");
      else if (status === 403) setMsg("Access denied. Admin only.");
      else setMsg(err?.response?.data?.message || "Failed to load staff/tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const assignTask = async (e) => {
    e.preventDefault();
    setMsg("");

    const token = getToken();
    if (!token) return setMsg("No token found. Please login again.");
    if (!staffId) return setMsg("Please select a staff member.");
    if (!title.trim()) return setMsg("Title is required.");
    if (!dueDate) return setMsg("Due date is required.");

    try {
      await axios.post(
        `${API}/api/staff/assign-task`,
        {
          staffId,
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("✅ Task assigned!");
      setTitle("");
      setDescription("");
      setPriority("High");
      setDueDate("");
      setStaffId("");

      await load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setMsg("Unauthorized. Please login again.");
      else if (status === 403) setMsg("Access denied. Admin only.");
      else setMsg(err?.response?.data?.message || "Failed to assign task");
    }
  };

  const getPriorityBadge = (value) => {
    const stylesMap = {
      High: { bg: "#f8d7da", color: "#8a3b46" },
      Medium: { bg: "#f7e7b4", color: "#8a6d1f" },
      Low: { bg: "#dff3e2", color: "#2f6b3b" },
    };

    const current = stylesMap[value] || { bg: "#eadcc6", color: "#6a5237" };

    return {
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: "999px",
      background: current.bg,
      color: current.color,
      fontSize: "12px",
      fontWeight: 800,
      marginRight: "8px",
    };
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.top}>
          <div>
            <h2 style={styles.heading}> Assign Work</h2>
            <p style={styles.subText}>
              Create tasks for staff members and track assigned work.
            </p>
          </div>

          <button onClick={load} style={styles.refreshBtn}>
            ⟳ Refresh
          </button>
        </div>

        {loading && <div style={styles.msg}>Loading...</div>}
        {msg && <div style={styles.msg}>{msg}</div>}

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Create Task</div>
            <div style={styles.divider}></div>

            <form onSubmit={assignTask}>
              <label style={styles.label}>Select Staff</label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                style={styles.input}
                required
              >
                <option value="">Choose staff</option>
                {staffList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>

              <label style={styles.label}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                required
              />

              <label style={styles.label}>Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={styles.input}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <label style={styles.label}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={styles.input}
                required
              />

              <button type="submit" style={styles.primaryBtn}>
                Assign Task
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Task Activity</div>
            <div style={styles.divider}></div>

            {!loading && tasks.length === 0 ? (
              <div style={styles.empty}>No tasks found.</div>
            ) : (
              <div style={styles.list}>
                {tasks.map((t) => (
                  <div key={t._id} style={styles.taskCard}>
                    <div style={styles.taskTitle}>{t.title}</div>

                    {t.description ? (
                      <div style={styles.taskDesc}>{t.description}</div>
                    ) : null}

                    <div style={styles.taskMeta}>
                      <span style={getPriorityBadge(t.priority || "-")}>
                        {t.priority || "-"}
                      </span>
                      <span>Status: {t.status || "-"}</span>
                    </div>

                    <div style={styles.taskMeta}>
                      Staff: {t.staff?.name || t.staff}
                    </div>

                    <div style={styles.taskMeta}>
                      Due: {t.dueDate ? String(t.dueDate).slice(0, 10) : "-"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

  subText: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#7a6f5d",
    fontSize: "15px",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  refreshBtn: {
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
    border: "1px solid #e6d8c4",
    marginBottom: 16,
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
    border: "1px solid #e6d8c4",
    padding: 18,
    borderRadius: 16,
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    marginTop: 4,
    color: "#2f2f2f",
  },

  divider: {
    height: 1,
    background: "#e6d8c4",
    marginBottom: 16,
  },

  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "#6b5d4d",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e6d8c4",
    marginBottom: 14,
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#ffffff",
    outline: "none",
    color: "#2c2c2c",
  },

  primaryBtn: {
    width: "100%",
    background: "#b08968",
    border: "none",
    color: "white",
    padding: "12px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 4,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: 520,
    overflow: "auto",
    paddingRight: 4,
  },

  taskCard: {
    background: "#f7efe3",
    border: "1px solid #e6d8c4",
    padding: 14,
    borderRadius: 12,
  },

  taskTitle: {
    fontWeight: 900,
    fontSize: 16,
    color: "#2c2c2c",
  },

  taskDesc: {
    marginTop: 6,
    color: "#555",
    lineHeight: 1.5,
  },

  taskMeta: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b5d4d",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  empty: {
    opacity: 0.8,
    color: "#6b5d4d",
  },
};