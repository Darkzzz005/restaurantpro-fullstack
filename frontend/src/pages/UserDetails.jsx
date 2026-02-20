import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";

const API = "http://localhost:5000";

export default function UserDetails() {
  const { name } = useParams();
  const [data, setData] = useState(null);

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDetails = async () => {
    // We’ll fetch all customers and match by name (fastest way without changing backend)
    const customersRes = await axios.get(`${API}/api/customers`, auth);
    const customer = customersRes.data.find((c) => c.customerName === decodeURIComponent(name));

    if (!customer) {
      setData({ notFound: true });
      return;
    }

    // Now fetch customer detail by id (this endpoint returns customer + orders + reservations)
    const detailRes = await axios.get(`${API}/api/customers/${customer._id}`, auth);
    setData(detailRes.data);
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line
  }, [name]);

  if (!data) {
    return (
      <Layout>
        <div style={{ padding: 20, color: "white" }}>Loading customer...</div>
      </Layout>
    );
  }

  if (data.notFound) {
    return (
      <Layout>
        <div style={{ padding: 20, color: "white" }}>Customer not found.</div>
      </Layout>
    );
  }

  const { customer, orders, reservations } = data;

  return (
    <Layout>
      <div style={{ color: "white" }}>
        <h1 style={{ marginTop: 0 }}>👤 {customer.customerName}</h1>
        <div style={styles.topGrid}>
          <div style={styles.box}>📞 Phone: <b>{customer.phone || "N/A"}</b></div>
          <div style={styles.box}>⭐ Loyalty Points: <b>{customer.loyaltyPoints}</b></div>
          <div style={styles.box}>🧾 Total Orders: <b>{customer.totalOrders}</b></div>
          <div style={styles.box}>💰 Total Spent: <b>₹{customer.totalSpent}</b></div>
        </div>

        <h2 style={{ marginTop: 24 }}>Recent Orders</h2>
        {orders.length === 0 ? (
          <div style={styles.empty}>No orders yet.</div>
        ) : (
          <div style={styles.list}>
            {orders.slice(0, 8).map((o) => (
              <div key={o._id} style={styles.item}>
                <div><b>{o.orderType}</b> • {o.status} • ₹{o.totalAmount}</div>
                <div style={{ opacity: 0.85, marginTop: 6 }}>
                  {o.items?.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                </div>
                <div style={{ opacity: 0.7, marginTop: 6 }}>
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ marginTop: 24 }}>Recent Reservations</h2>
        {reservations.length === 0 ? (
          <div style={styles.empty}>No reservations yet.</div>
        ) : (
          <div style={styles.list}>
            {reservations.slice(0, 8).map((r) => (
              <div key={r._id} style={styles.item}>
                <div><b>Table {r.tableNo}</b> • {r.status}</div>
                <div style={{ opacity: 0.85, marginTop: 6 }}>
                  {r.date} • {r.time} • Guests: {r.guests}
                </div>
                <div style={{ opacity: 0.7, marginTop: 6 }}>
                  {r.notes || "—"}
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
  topGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
    marginTop: 12,
  },
  box: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 12,
  },
  empty: {
    background: "#1e293b",
    padding: 14,
    borderRadius: 12,
    opacity: 0.9,
  },
  list: {
    display: "grid",
    gap: 12,
  },
  item: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 12,
  },
};
