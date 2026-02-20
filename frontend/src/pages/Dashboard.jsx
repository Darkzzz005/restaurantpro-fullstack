import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setMsg("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("No token found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API}/api/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.top}>
          <div>
            <h2 style={{ margin: 0 }}>📊 Analytics Dashboard</h2>
            <p style={styles.sub}>Live summary of your restaurant activity</p>
          </div>
          <button onClick={fetchAnalytics} style={styles.btn}>⟳ Refresh</button>
        </div>

        {loading && <div style={styles.msg}>Loading analytics...</div>}
        {msg && <div style={styles.msg}>{msg}</div>}

        {data && (
          <>
            {/* TOP CARDS */}
            <div style={styles.grid}>
              <Card title="Total Orders" value={data.totalOrders} />
              <Card title="Reservations" value={data.totalReservations} />
              <Card title="Total Staff" value={data.totalStaff} />
              <Card title="Menu Items" value={data.totalMenuItems} />
              <Card title="Payments" value={data.totalPayments} />
              <Card title="Revenue" value={`₹ ${Number(data.totalRevenue || 0).toLocaleString()}`} />
            </div>

            {/* ORDERS PER DAY */}
            <div style={styles.panel}>
              <div style={styles.panelTitle}>📅 Orders (Last days)</div>

              {data.ordersPerDay?.length === 0 ? (
                <div style={styles.empty}>No order chart data.</div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ordersPerDay.map((d) => (
                        <tr key={d._id}>
                          <td style={styles.td}>{d._id}</td>
                          <td style={styles.td}>{d.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",   // 🔥 Dark navy background
    padding: 20,
    color: "white",
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
    color: "#94a3b8",
    fontSize: 13,
  },

  btn: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 16,
  },

  card: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
  },

  cardTitle: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: 800,
  },

  cardValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: 900,
    color: "white",
  },

  panel: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
  },

  panelTitle: {
    fontWeight: 900,
    marginBottom: 10,
  },

  empty: {
    opacity: 0.9,
  },

  tableWrap: {
    overflow: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 480,
  },

  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    color: "#cbd5e1",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
};
