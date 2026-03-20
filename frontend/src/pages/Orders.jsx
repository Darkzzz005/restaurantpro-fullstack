import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
    const res = await axios.get(`${API}/api/orders`, authConfig);
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/api/orders/${id}`, { status }, authConfig);
    fetchOrders();
  };

  const badge = (status) => {
    const styleMap = {
      Pending: { bg: "#f4d58d", color: "#6b4f2a" },
      Preparing: { bg: "#c9daf8", color: "#355c7d" },
      Completed: { bg: "#cfe8cf", color: "#466b46" },
      Cancelled: { bg: "#f2c6c2", color: "#8b4a43" },
    };

    const current = styleMap[status] || {
      bg: "#eadcc6",
      color: "#6a5237",
    };

    return (
      <span
        style={{
          padding: "8px 14px",
          borderRadius: "999px",
          backgroundColor: current.bg,
          color: current.color,
          fontWeight: 800,
          fontSize: "13px",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.heading}> Orders Management</h1>
            <p style={styles.subText}>
              Track customer orders, payment status, and preparation progress.
            </p>
          </div>

          <button onClick={fetchOrders} style={styles.refreshBtn}>
            ⟳ Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={styles.empty}>No orders found.</div>
        ) : (
          <div style={styles.grid}>
            {orders.map((o) => (
              <div key={o._id} style={styles.card}>
                <div style={styles.topRow}>
                  <div>
                    <div style={styles.customer}>
                      Customer: {o.customerName}
                    </div>
                    <div style={styles.mini}>
                      Type: <b>{o.orderType || "Parcel"}</b>
                    </div>
                  </div>
                  {badge(o.status)}
                </div>

                {o.orderType === "Delivery" && (
                  <div style={styles.deliveryBox}>
                    <div>
                      <b>Address:</b> {o.deliveryAddress || "-"}
                    </div>
                    <div>
                      <b>Scheduled:</b> {o.scheduledTime || "-"}
                    </div>
                  </div>
                )}

                <div style={styles.total}>
                  Total: <b>₹{o.totalAmount}</b>
                </div>

                <div style={styles.items}>
                  <b>Items:</b>{" "}
                  {o.items?.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                </div>

                <div style={styles.paymentRow}>
                  <div style={{ fontWeight: 800, color: "#2c2c2c" }}>
                    Payment:{" "}
                    <span
                      style={{
                        color:
                          o.paymentStatus === "Paid" ? "#5c8a5c" : "#b7791f",
                      }}
                    >
                      {o.paymentStatus || "Unpaid"}
                    </span>
                  </div>

                  {o.paymentStatus === "Paid" && o.invoiceUrl && (
                    <a
                      href={`${API}${o.invoiceUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.invoiceBtn}
                    >
                      🧾 View Invoice
                    </a>
                  )}
                </div>

                <div style={styles.actionRow}>
                  <span style={{ fontWeight: 700, color: "#2c2c2c" }}>
                    Update Status:
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    style={styles.select}
                  >
                    <option>Pending</option>
                    <option>Preparing</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
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

  subText: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#7a6f5d",
    fontSize: "15px",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },

  refreshBtn: {
    background: "#b08968",
    border: "none",
    color: "white",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },

  empty: {
    marginTop: "18px",
    background: "#fffaf3",
    padding: "18px",
    borderRadius: "16px",
    border: "1px solid #e6d8c3",
    color: "#7a6f5d",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "18px",
  },

  card: {
    backgroundColor: "#fffaf3",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid #e6d8c3",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },

  customer: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#2c2c2c",
  },

  mini: {
    marginTop: "6px",
    color: "#6f6657",
  },

  deliveryBox: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "14px",
    background: "#f3ebdf",
    border: "1px solid #e6d8c3",
    color: "#4d453a",
  },

  total: {
    marginTop: "14px",
    color: "#2c2c2c",
    fontSize: "17px",
  },

  items: {
    marginTop: "10px",
    color: "#6f6657",
    lineHeight: 1.6,
  },

  paymentRow: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  invoiceBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#d8c3a5",
    color: "#4e3723",
    fontWeight: 700,
    textDecoration: "none",
    border: "1px solid #ccb08a",
  },

  actionRow: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d8c7b0",
    background: "#fffdf9",
    color: "#2c2c2c",
    cursor: "pointer",
    minWidth: "160px",
    fontWeight: 700,
  },
};