import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function Users() {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    const res = await axios.get(`${API}/api/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <Layout>
      <div style={{ minHeight: "100vh" }}>
        <div style={styles.headerRow}>
          <h1 style={{ margin: 0 }}>👤 Customers</h1>
          <button onClick={fetchCustomers} style={styles.btn}>⟳ Refresh</button>
        </div>

        {customers.length === 0 ? (
          <div style={styles.empty}>No customers found yet.</div>
        ) : (
          <div style={styles.grid}>
            {customers.map((c) => (
              <div
                key={c.customerName}
                style={styles.card}
                onClick={() => navigate(`/users/${encodeURIComponent(c.customerName)}`)}
              >
                <div style={styles.name}>{c.customerName}</div>
                <div style={styles.mini}>📞 {c.phone || "N/A"}</div>
                <div style={styles.row}>Orders: <b>{c.totalOrders}</b></div>
                <div style={styles.row}>Reservations: <b>{c.totalReservations}</b></div>
                <div style={styles.row}>Spent: <b>₹{c.totalSpent}</b></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  btn: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  empty: {
    marginTop: 16,
    background: "#1e293b",
    padding: 16,
    borderRadius: 12,
    opacity: 0.9,
  },
  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  card: {
    background: "#1e293b",
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
  },
  name: { fontSize: 18, fontWeight: 900 },
  mini: { marginTop: 6, opacity: 0.85 },
  row: { marginTop: 8, opacity: 0.95 },
};
