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
    const color =
      status === "Pending"
        ? "#fbbf24"
        : status === "Preparing"
        ? "#3b82f6"
        : status === "Completed"
        ? "#22c55e"
        : "#ef4444";

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "999px",
          backgroundColor: color,
          color: "#0b1220",
          fontWeight: 800,
          fontSize: "12px",
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
          <h1 style={{ margin: 0 }}>🧾 Orders Management</h1>
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

                {/* ✅ PAYMENT STATUS ONLY (NO PAY BUTTON) */}
                <div style={styles.paymentRow}>
                  <div style={{ fontWeight: 800 }}>
                    Payment:{" "}
                    <span
                      style={{
                        color:
                          o.paymentStatus === "Paid"
                            ? "#22c55e"
                            : "#fbbf24",
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
                  <span style={{ fontWeight: 700 }}>
                    Update Status:
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) =>
                      updateStatus(o._id, e.target.value)
                    }
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
  page: { minHeight: "100vh" },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  refreshBtn: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },

  empty: {
    marginTop: "18px",
    background: "#1e293b",
    padding: "16px",
    borderRadius: "12px",
    opacity: 0.9,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "16px",
  },

  card: {
    backgroundColor: "#1e293b",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  customer: { fontSize: "18px", fontWeight: 900 },

  mini: { marginTop: "6px", opacity: 0.9 },

  deliveryBox: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "12px",
    background: "rgba(15,23,42,0.55)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  total: { marginTop: "12px" },

  items: { marginTop: "8px", opacity: 0.9 },

  paymentRow: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  invoiceBtn: {
    padding: "8px 12px",
    borderRadius: "10px",
    background: "#334155",
    color: "white",
    fontWeight: 700,
    textDecoration: "none",
  },

  actionRow: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  select: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    minWidth: "150px",
    fontWeight: 700,
  },
};
