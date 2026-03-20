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
    const customersRes = await axios.get(`${API}/api/customers`, auth);
    const customer = customersRes.data.find(
      (c) => c.customerName === decodeURIComponent(name)
    );

    if (!customer) {
      setData({ notFound: true });
      return;
    }

    const detailRes = await axios.get(`${API}/api/customers/${customer._id}`, auth);
    setData(detailRes.data);
  };

  useEffect(() => {
    fetchDetails();
  }, [name]);

  if (!data) {
    return (
      <Layout>
        <div style={{ padding: 20 }}>Loading customer...</div>
      </Layout>
    );
  }

  if (data.notFound) {
    return (
      <Layout>
        <div style={{ padding: 20 }}>Customer not found.</div>
      </Layout>
    );
  }

  const { customer, orders, reservations } = data;

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={{ marginTop: 0 }}>👤 {customer.customerName}</h1>

        {/* TOP INFO */}
        <div style={styles.topGrid}>
          <div style={styles.box}>📞 Phone: <b>{customer.phone || "N/A"}</b></div>
          <div style={styles.box}>⭐ Loyalty Points: <b>{customer.loyaltyPoints}</b></div>
          <div style={styles.box}>🧾 Total Orders: <b>{customer.totalOrders}</b></div>
          <div style={styles.box}>💰 Total Spent: <b>₹{customer.totalSpent}</b></div>
        </div>

        {/* ORDERS */}
        <h2 style={{ marginTop: 30 }}>Recent Orders</h2>

        {orders.length === 0 ? (
          <div style={styles.empty}>No orders yet.</div>
        ) : (
          <div style={styles.list}>
            {orders.slice(0, 8).map((o) => (
              <div key={o._id} style={styles.item}>
                <div style={styles.title}>
                  {o.orderType} • {o.status} • ₹{o.totalAmount}
                </div>

                <div style={styles.desc}>
                  {o.items?.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                </div>

                <div style={styles.time}>
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESERVATIONS */}
        <h2 style={{ marginTop: 30 }}>Recent Reservations</h2>

        {reservations.length === 0 ? (
          <div style={styles.empty}>No reservations yet.</div>
        ) : (
          <div style={styles.list}>
            {reservations.slice(0, 8).map((r) => (
              <div key={r._id} style={styles.item}>
                <div style={styles.title}>
                  Table {r.tableNo} • {r.status}
                </div>

                <div style={styles.desc}>
                  {r.date} • {r.time} • Guests: {r.guests}
                </div>

                <div style={styles.time}>
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
  page: {
    minHeight: "100vh",
    padding: "20px",
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginTop: 14,
  },

  box: {
    background: "#f5efe4",
    border: "1px solid #e6d8c4",
    padding: 16,
    borderRadius: 14,
    fontWeight: 600,
  },

  empty: {
    background: "#f5efe4",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #e6d8c4",
  },

  list: {
    display: "grid",
    gap: 12,
  },

  item: {
    background: "#f5efe4",
    border: "1px solid #e6d8c4",
    padding: 16,
    borderRadius: 14,
  },

  title: {
    fontWeight: 700,
  },

  desc: {
    marginTop: 6,
    color: "#555",
  },

  time: {
    marginTop: 6,
    color: "#777",
    fontSize: "13px",
  },
};