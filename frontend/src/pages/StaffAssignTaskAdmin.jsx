import { useEffect, useState } from "react";
import axios from "axios";

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
      // staff list
      const s = await axios.get(`${API}/api/staff`, auth);
      setStaffList(Array.isArray(s.data) ? s.data : []);

      // tasks list (admin)
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
    if (!token) {
      setMsg("No token found. Please login again.");
      return;
    }

    if (!staffId) return setMsg("Please select a staff member.");
    if (!title.trim()) return setMsg("Title is required.");
    if (!dueDate) return setMsg("Due date is required.");

    try {
      await axios.post(
        `${API}/api/staff/assign-task`,
        {
          staff: staffId,
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

  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <h2 style={{ margin: 0 }}>🧹 Assign Work</h2>
        <button onClick={load} style={styles.btn}>
          ⟳ Refresh
        </button>
      </div>

      {loading && <div style={styles.msg}>Loading...</div>}
      {msg && <div style={styles.msg}>{msg}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Assign New Task</h3>

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

            <button type="submit" style={styles.primary}>
              Assign
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Assigned Tasks</h3>

          {!loading && tasks.length === 0 ? (
            <div style={styles.empty}>No tasks found.</div>
          ) : (
            <div style={styles.list}>
              {tasks.map((t) => (
                <div key={t._id} style={styles.row}>
                  <div style={{ fontWeight: 900 }}>{t.title}</div>
                  {t.description ? <div style={styles.small}>{t.description}</div> : null}

                  <div style={styles.small}>
                    Priority: {t.priority || "-"} • Status: {t.status || "-"}
                  </div>

                  <div style={styles.small}>
                    Staff: {t.staff?.name || t.staff}
                  </div>

                  <div style={styles.small}>
                    Due: {t.dueDate ? String(t.dueDate) : "-"}
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
  page: { minHeight: "100vh" },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  card: {
    background: "#1e293b",
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  label: { display: "block", marginBottom: 6, color: "#cbd5e1", fontSize: 13 },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "none",
    outline: "none",
    marginBottom: 12,
  },
  primary: {
    width: "100%",
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  empty: { opacity: 0.9 },
  list: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflow: "auto" },
  row: {
    background: "rgba(255,255,255,0.04)",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  small: { color: "#cbd5e1", fontSize: 13, marginTop: 4 },
};
