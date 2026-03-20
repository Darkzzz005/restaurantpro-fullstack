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
            <h2 style={styles.heading}> Analytics Dashboard</h2>
            <p style={styles.sub}>Live summary of your restaurant activity</p>
          </div>
          <button onClick={fetchAnalytics} style={styles.btn}>⟳ Refresh</button>
        </div>

        {loading && <div style={styles.msg}>Loading analytics...</div>}
        {msg && <div style={styles.msg}>{msg}</div>}

        {data && (
          <>
            <div style={styles.grid}>
              <Card title="Total Orders" value={data.totalOrders} />
              <Card title="Reservations" value={data.totalReservations} />
              <Card title="Total Staff" value={data.totalStaff} />
              <Card title="Menu Items" value={data.totalMenuItems} />
              <Card title="Payments" value={data.totalPayments} />
              <Card
                title="Revenue"
                value={`₹ ${Number(data.totalRevenue || 0).toLocaleString()}`}
              />
            </div>

            <div style={styles.panel}>
              <div style={styles.panelTitle}> Orders (Last days)</div>

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
    background: "#f7f3ea",
    padding: 20,
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
    color: "#7a6f5d",
    fontSize: 14,
  },

  btn: {
    background: "#b08968",
    border: "none",
    color: "white",
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
  },

  msg: {
    background: "#fffaf3",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    border: "1px solid #e6d8c3",
    color: "#2c2c2c",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },

  card: {
    background: "#fffaf3",
    border: "1px solid #e6d8c3",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  cardTitle: {
    color: "#7a6f5d",
    fontSize: 14,
    fontWeight: 800,
  },

  cardValue: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: 900,
    color: "#2c2c2c",
  },

  panel: {
    background: "#fffaf3",
    border: "1px solid #e6d8c3",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  panelTitle: {
    fontWeight: 900,
    marginBottom: 12,
    fontSize: 22,
    color: "#2c2c2c",
  },

  empty: {
    color: "#7a6f5d",
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
    borderBottom: "1px solid #e6d8c3",
    color: "#7a6f5d",
    fontWeight: 800,
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #efe3d3",
    color: "#2c2c2c",
  },
};