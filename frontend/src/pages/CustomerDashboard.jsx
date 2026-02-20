import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [menu, setMenu] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // ✅ CART
  const [cart, setCart] = useState([]); // [{_id,name,price,quantity}]

  // ✅ CHECKOUT FIELDS
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState("Parcel"); // Parcel / Dining / Delivery
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Cash / UPI / Razorpay

  // ✅ REVIEWS
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // ✅ RESERVATION (NEW)
  const [resName, setResName] = useState(user?.name || "");
  const [resPhone, setResPhone] = useState("");
  const [resDate, setResDate] = useState("");
  const [resTime, setResTime] = useState("");
  const [resGuests, setResGuests] = useState(2);
  const [resNotes, setResNotes] = useState("");
  const [bookedTables, setBookedTables] = useState([]);
  const [myReservations, setMyReservations] = useState([]);

  const [msg, setMsg] = useState("");

  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const loadAll = async () => {
    setMsg("");
    const [menuRes, ordersRes, myResRes] = await Promise.all([
      api.get("/api/menu?available=true"),
      api.get("/api/orders/my"),
      api.get("/api/reservations/my"), // ✅ NEW
    ]);

    setMenu(menuRes.data || []);
    setMyOrders(ordersRes.data || []);
    setMyReservations(myResRes.data || []); // ✅ NEW
  };

  useEffect(() => {
    loadAll().catch((e) => {
      setMsg(e?.response?.data?.message || "Failed to load customer data");
    });
    // eslint-disable-next-line
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // ✅ ADD TO CART
  const addToCart = (m) => {
    setCart((prev) => {
      const exists = prev.find((x) => x._id === m._id);
      if (exists) {
        return prev.map((x) =>
          x._id === m._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [
        ...prev,
        { _id: m._id, name: m.name, price: m.price, quantity: 1 },
      ];
    });
  };

  const updateQty = (id, qty) => {
    const q = Number(qty);
    if (Number.isNaN(q) || q < 1) return;
    setCart((prev) => prev.map((x) => (x._id === id ? { ...x, quantity: q } : x)));
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((x) => x._id !== id));
  };

  // ✅ PLACE ORDER
  const placeOrder = async () => {
    setMsg("");

    if (cart.length === 0) {
      setMsg("Cart is empty. Add items first.");
      return;
    }
    if (!customerName || !phone) {
      setMsg("Name and phone are required.");
      return;
    }
    if (orderType === "Delivery" && !deliveryAddress) {
      setMsg("Delivery address required for Delivery.");
      return;
    }

    try {
      const payload = {
        customerName,
        phone,
        orderType,
        deliveryAddress: orderType === "Delivery" ? deliveryAddress : "",
        scheduledTime: scheduledTime || "",
        paymentMethod,
        paymentStatus: "Unpaid", // keep unpaid, then pay using Razorpay button
        items: cart.map((c) => ({
          name: c.name,
          price: c.price,
          quantity: c.quantity,
        })),
        totalAmount,
      };

      await api.post("/api/orders", payload);

      setMsg("✅ Order placed successfully!");
      setCart([]);
      await loadAll();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to place order");
    }
  };

  // ✅ REVIEWS
  const submitReview = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await api.post("/api/reviews", {
        menuItemId: selectedMenuId,
        rating: Number(rating),
        comment,
      });
      setMsg("✅ Review submitted!");
      setComment("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to submit review");
    }
  };

  // ✅ RESERVATION: CHECK AVAILABILITY (NEW)
  const checkAvailability = async (d, t) => {
    if (!d || !t) return;
    try {
      // IMPORTANT: using api so token is attached
      const res = await api.get(
        `/api/reservations/availability?date=${d}&time=${t}`
      );
      setBookedTables(res.data.bookedTables || []);
    } catch (e) {
      // if token missing/expired => 401
      setBookedTables([]);
    }
  };

  // ✅ RESERVATION: BOOK (NEW)
  const bookReservation = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!resName || !resPhone || !resDate || !resTime || !resGuests) {
      setMsg("Please fill all reservation fields.");
      return;
    }

    try {
      await api.post("/api/reservations", {
        customerName: resName,
        phone: resPhone,
        date: resDate,
        time: resTime,
        guests: Number(resGuests),
        notes: resNotes || "",
      });

      setMsg("✅ Reservation booked!");
      setResNotes("");
      await loadAll();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Reservation booking failed");
    }
  };

  // ✅ PAY NOW (Razorpay)
  const payNow = async (order) => {
    setMsg("");
    try {
      const createRes = await api.post("/api/payments/razorpay/order", {
        orderId: order._id,
      });

      const { keyId, razorpayOrderId, amount, currency, dbOrderId } = createRes.data;

      if (!keyId) {
        setMsg("Razorpay keyId missing. Check backend .env RAZORPAY_KEY_ID");
        return;
      }

      if (!window.Razorpay) {
        setMsg("Razorpay script not loaded. Add it to index.html.");
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "RestaurantPro",
        description: `Payment for Order ${dbOrderId}`,
        handler: async function (response) {
          try {
            await api.post("/api/payments/razorpay/verify", {
              dbOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setMsg("✅ Payment successful!");
            await loadAll();
          } catch (err) {
            setMsg(err?.response?.data?.message || "Payment verification failed");
          }
        },
        theme: { color: "#3b82f6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to start payment");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>RestaurantPro</h1>
          <p style={styles.sub}>
            Customer Dashboard{user?.name ? ` • ${user.name}` : ""}
          </p>
        </div>
        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>

      {msg && <div style={styles.msg}>{msg}</div>}

      <div style={styles.grid}>
        {/* ✅ MENU + ADD TO CART */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Menu (Available)</h3>
          <div style={styles.list}>
            {menu.map((m) => (
              <div key={m._id} style={styles.row}>
                <div>
                  <b>{m.name}</b>
                  <div style={styles.small}>
                    {m.category} • ₹{m.price}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={styles.smallBtn}
                    onClick={() => setSelectedMenuId(m._id)}
                  >
                    Review
                  </button>
                  <button style={styles.primaryBtn} onClick={() => addToCart(m)}>
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ CART + CHECKOUT */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🛒 Cart</h3>

          {cart.length === 0 ? (
            <p style={styles.small}>Cart is empty.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cart.map((c) => (
                <div key={c._id} style={styles.orderRow}>
                  <div>
                    <b>{c.name}</b>
                    <div style={styles.small}>₹{c.price} each</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      min={1}
                      value={c.quantity}
                      onChange={(e) => updateQty(c._id, e.target.value)}
                      style={styles.qty}
                    />
                    <button
                      style={styles.dangerBtn}
                      onClick={() => removeFromCart(c._id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div style={styles.totalRow}>
                <span>Total</span>
                <b>₹{totalAmount}</b>
              </div>
            </div>
          )}

          <hr style={styles.hr} />

          <h3 style={styles.cardTitle}>Checkout</h3>

          <label style={styles.label}>Name</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} />

          <label style={styles.label}>Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            style={styles.input}
          >
            <option>Parcel</option>
            <option>Dining</option>
            <option>Delivery</option>
          </select>

          {orderType === "Delivery" && (
            <>
              <label style={styles.label}>Delivery Address</label>
              <input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={styles.input}
              />
            </>
          )}

          <label style={styles.label}>Scheduled Time (optional)</label>
          <input
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={styles.input}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Razorpay</option>
          </select>

          <button onClick={placeOrder} style={{ ...styles.primaryBtn, width: "100%" }}>
            ✅ Place Order
          </button>
        </div>

        {/* ✅ RESERVATIONS (NEW) */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📅 Book a Table</h3>

          <form onSubmit={bookReservation}>
            <label style={styles.label}>Name</label>
            <input
              value={resName}
              onChange={(e) => setResName(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Phone</label>
            <input
              value={resPhone}
              onChange={(e) => setResPhone(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Date</label>
            <input
              type="date"
              value={resDate}
              onChange={(e) => {
                setResDate(e.target.value);
                checkAvailability(e.target.value, resTime);
              }}
              style={styles.input}
            />

            <label style={styles.label}>Time</label>
            <input
              type="time"
              value={resTime}
              onChange={(e) => {
                setResTime(e.target.value);
                checkAvailability(resDate, e.target.value);
              }}
              style={styles.input}
            />

            <div style={styles.small}>
              Booked tables:{" "}
              {bookedTables.length === 0 ? "None" : bookedTables.join(", ")}
            </div>

            <label style={styles.label}>Guests</label>
            <input
              type="number"
              min={1}
              value={resGuests}
              onChange={(e) => setResGuests(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Notes</label>
            <input
              value={resNotes}
              onChange={(e) => setResNotes(e.target.value)}
              placeholder="Window seat, birthday, etc."
              style={styles.input}
            />

            <button type="submit" style={{ ...styles.primaryBtn, width: "100%" }}>
              ✅ Book Reservation
            </button>
          </form>

          <hr style={styles.hr} />

          <h3 style={styles.cardTitle}>My Reservations</h3>
          {myReservations.length === 0 ? (
            <p style={styles.small}>No reservations yet.</p>
          ) : (
            <div style={styles.list}>
              {myReservations.map((r) => (
                <div key={r._id} style={styles.orderRow}>
                  <div>
                    <b>
                      {r.date} {r.time}
                    </b>{" "}
                    <span style={styles.badge}>{r.status}</span>
                    <div style={styles.small}>
                      Guests: {r.guests}{" "}
                      {r.tableNo ? `• Table: ${r.tableNo}` : "• Table: Not assigned yet"}
                    </div>
                    {r.notes ? <div style={styles.small}>{r.notes}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Give Review</h3>

          <form onSubmit={submitReview}>
            <label style={styles.label}>Menu Item</label>
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              style={styles.input}
              required
            >
              <option value="">Select item</option>
              {menu.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>

            <label style={styles.label}>Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              style={styles.input}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <label style={styles.label}>Comment</label>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type feedback..."
              style={styles.input}
            />

            <button type="submit" style={styles.primaryBtn}>
              Submit Review
            </button>
          </form>
        </div>

        {/* My Orders */}
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h3 style={styles.cardTitle}>My Orders</h3>
          {myOrders.length === 0 ? (
            <p style={styles.small}>No orders yet.</p>
          ) : (
            <div style={styles.list}>
              {myOrders.map((o) => (
                <div key={o._id} style={styles.orderRow}>
                  <div>
                    <b>₹{o.totalAmount}</b>{" "}
                    <span style={styles.badge}>{o.status}</span>{" "}
                    <span style={styles.badge2}>{o.paymentStatus}</span>
                    <div style={styles.small}>
                      {o.orderType} • {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {o.paymentStatus !== "Paid" ? (
                    <button style={styles.primaryBtn} onClick={() => payNow(o)}>
                      Pay Now
                    </button>
                  ) : (
                    <button style={styles.disabledBtn} disabled>
                      Paid
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* More */}
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h3 style={styles.cardTitle}>More</h3>
          <button style={styles.smallBtn} onClick={() => navigate("/my-orders")}>
            Open My Orders Page
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#0f172a", color: "white", padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { margin: 0, fontSize: 28 },
  sub: { margin: "6px 0 0", color: "#94a3b8" },
  logout: { background: "#ef4444", color: "white", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer" },
  msg: { background: "#1e293b", padding: 12, borderRadius: 10, marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: { background: "#1e293b", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" },
  cardTitle: { marginTop: 0, marginBottom: 12 },
  list: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflow: "auto" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.04)" },
  orderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.04)" },
  totalRow: { display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" },
  small: { color: "#94a3b8", fontSize: 13, marginTop: 4 },
  label: { display: "block", marginBottom: 6, color: "#cbd5e1", fontSize: 13 },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "none", outline: "none", marginBottom: 12 },
  qty: { width: 70, padding: 8, borderRadius: 8, border: "none", outline: "none" },
  primaryBtn: { background: "#3b82f6", color: "white", border: "none", padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 },
  smallBtn: { background: "rgba(59,130,246,0.15)", color: "white", border: "1px solid rgba(59,130,246,0.35)", padding: "8px 10px", borderRadius: 8, cursor: "pointer" },
  dangerBtn: { background: "rgba(239,68,68,0.20)", color: "white", border: "1px solid rgba(239,68,68,0.35)", padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 800 },
  disabledBtn: { background: "#334155", color: "#94a3b8", border: "none", padding: "10px 12px", borderRadius: 8 },
  badge: { marginLeft: 8, padding: "3px 8px", borderRadius: 999, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)" },
  badge2: { marginLeft: 8, padding: "3px 8px", borderRadius: 999, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)" },
  hr: { border: "none", borderTop: "1px solid rgba(255,255,255,0.10)", margin: "14px 0" },
};

export default CustomerDashboard;