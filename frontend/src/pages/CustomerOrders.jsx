import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
    const res = await axios.get(`${API}/api/orders/my`, authConfig);
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
   
  }, []);

  const payNow = async (order) => {
    const ok = await loadRazorpay();
    if (!ok) return alert("Razorpay SDK failed to load.");

    try {
      const createRes = await axios.post(
        `${API}/api/payments/create-order/${order._id}`,
        {},
        authConfig
      );

      const { keyId, amount, currency, razorpayOrderId, customerName, phone } =
        createRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "RestaurantPro",
        description: `Order Payment - ${order.customerName}`,
        order_id: razorpayOrderId,
        prefill: { name: customerName, contact: phone || "" },

        handler: async function (response) {
          await axios.post(
            `${API}/api/payments/verify`,
            {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: "Razorpay",
            },
            authConfig
          );

          alert("✅ Payment Successful!");
          fetchOrders();
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment start failed.");
    }
  };

  return (
    <Layout>
      <div style={{ padding: 20 }}>
        <h1>🛒 My Orders</h1>

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((o) => (
            <div
              key={o._id}
              style={{
                background: "#1e293b",
                color: "white",
                padding: 16,
                borderRadius: 12,
                marginTop: 12,
              }}
            >
              <b>Order:</b> {o._id}
              <br />
              <b>Total:</b> ₹{o.totalAmount}
              <br />
              <b>Status:</b> {o.status}
              <br />
              <b>Payment:</b>{" "}
              <span style={{ color: o.paymentStatus === "Paid" ? "#22c55e" : "#fbbf24" }}>
                {o.paymentStatus || "Unpaid"}
              </span>

              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                {o.paymentStatus !== "Paid" && (
                  <button
                    onClick={() => payNow(o)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      background: "#a855f7",
                      color: "white",
                      fontWeight: 800,
                    }}
                  >
                    💳 Pay Now
                  </button>
                )}

                {o.paymentStatus === "Paid" && o.invoiceUrl && (
                  <a
                    href={`${API}${o.invoiceUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#334155",
                      color: "white",
                      textDecoration: "none",
                      fontWeight: 800,
                    }}
                  >
                    🧾 View Invoice
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
