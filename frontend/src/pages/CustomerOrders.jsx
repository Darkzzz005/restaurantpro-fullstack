import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [menu, setMenu] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  const [cart, setCart] = useState([]);

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState("Parcel");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [resName, setResName] = useState(user?.name || "");
  const [resPhone, setResPhone] = useState("");
  const [resDate, setResDate] = useState("");
  const [resTime, setResTime] = useState("");
  const [resGuests, setResGuests] = useState(2);
  const [resNotes, setResNotes] = useState("");
  const [bookedTables, setBookedTables] = useState([]);
  const [myReservations, setMyReservations] = useState([]);

  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState("All");

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

  const categories = useMemo(() => {
    const allCategories = menu.map((item) => item.category).filter(Boolean);
    return ["All", ...new Set(allCategories)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesSearch = item.name
        ?.toLowerCase()
        .includes(menuSearch.toLowerCase());

      const matchesCategory =
        menuCategory === "All" || item.category === menuCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menu, menuSearch, menuCategory]);

  const loadAll = async () => {
    setMsg("");
    const [menuRes, ordersRes, myResRes] = await Promise.all([
      api.get("/api/menu?available=true"),
      api.get("/api/orders/my"),
      api.get("/api/reservations/my"),
    ]);

    setMenu(menuRes.data || []);
    setMyOrders(ordersRes.data || []);
    setMyReservations(myResRes.data || []);
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
        paymentStatus: "Unpaid",
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

  const checkAvailability = async (d, t) => {
    if (!d || !t) return;
    try {
      const res = await api.get(
        `/api/reservations/availability?date=${d}&time=${t}`
      );
      setBookedTables(res.data.bookedTables || []);
    } catch (e) {
      setBookedTables([]);
    }
  };

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
        theme: { color: "#b08968" },
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
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Menu (Available)</h3>

          <div style={styles.filterWrap}>
            <input
              type="text"
              placeholder="Search menu item..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              style={styles.field}
            />

            <select
              value={menuCategory}
              onChange={(e) => setMenuCategory(e.target.value)}
              style={styles.field}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.list}>
            {filteredMenu.length === 0 ? (
              <div style={styles.emptyState}>No menu items found.</div>
            ) : (
              filteredMenu.map((m) => (
                <div key={m._id} style={styles.row}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {m.image && (
                      <img
                        src={`http://localhost:5000${m.image}`}
                        alt={m.name}
                        style={styles.menuImage}
                      />
                    )}

                    <div>
                      <b style={styles.itemName}>{m.name}</b>
                      <div style={styles.small}>
                        {m.category} • ₹{m.price}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
              ))
            )}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🛒 Cart</h3>

          {cart.length === 0 ? (
            <p style={styles.small}>Cart is empty.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cart.map((c) => (
                <div key={c._id} style={styles.orderRow}>
                  <div>
                    <b style={styles.itemName}>{c.name}</b>
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

          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={styles.field}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.field}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              style={styles.field}
            >
              <option>Parcel</option>
              <option>Dining</option>
              <option>Delivery</option>
            </select>
          </div>

          {orderType === "Delivery" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Delivery Address</label>
              <input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={styles.field}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Scheduled Time (optional)</label>
            <input
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              style={styles.field}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={styles.field}
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Razorpay</option>
            </select>
          </div>

          <button onClick={placeOrder} style={{ ...styles.primaryBtn, width: "100%" }}>
            ✅ Place Order
          </button>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📅 Book a Table</h3>

          <form onSubmit={bookReservation}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                value={resName}
                onChange={(e) => setResName(e.target.value)}
                style={styles.field}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                value={resPhone}
                onChange={(e) => setResPhone(e.target.value)}
                style={styles.field}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={resDate}
                onChange={(e) => {
                  setResDate(e.target.value);
                  checkAvailability(e.target.value, resTime);
                }}
                style={styles.field}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Time</label>
              <input
                type="time"
                value={resTime}
                onChange={(e) => {
                  setResTime(e.target.value);
                  checkAvailability(resDate, e.target.value);
                }}
                style={styles.field}
              />
            </div>

            <div style={{ ...styles.small, marginBottom: 12 }}>
              Booked tables: {bookedTables.length === 0 ? "None" : bookedTables.join(", ")}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Guests</label>
              <input
                type="number"
                min={1}
                value={resGuests}
                onChange={(e) => setResGuests(e.target.value)}
                style={styles.field}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={resNotes}
                onChange={(e) => setResNotes(e.target.value)}
                placeholder="Window seat, birthday, etc."
                style={styles.textarea}
              />
            </div>

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
                    <b style={styles.itemName}>
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

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Give Review</h3>

          <form onSubmit={submitReview}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Menu Item</label>
              <select
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                style={styles.field}
                required
              >
                <option value="">Select item</option>
                {menu.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={styles.field}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type feedback..."
                style={styles.textarea}
              />
            </div>

            <button type="submit" style={styles.primaryBtn}>
              Submit Review
            </button>
          </form>
        </div>

        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h3 style={styles.cardTitle}>My Orders</h3>
          {myOrders.length === 0 ? (
            <p style={styles.small}>No orders yet.</p>
          ) : (
            <div style={styles.list}>
              {myOrders.map((o) => (
                <div key={o._id} style={styles.orderRow}>
                  <div>
                    <b style={styles.itemName}>₹{o.totalAmount}</b>{" "}
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
  container: {
    minHeight: "100vh",
    background: "#f7f3ea",
    color: "#2c2c2c",
    padding: 24,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#2c2c2c",
  },

  sub: {
    margin: "6px 0 0",
    color: "#7a6f5d",
  },

  logout: {
    background: "#d9534f",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },

  msg: {
    background: "#f5efe4",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    border: "1px solid #e6d8c4",
    color: "#5f5448",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 16,
  },

  card: {
    background: "#fffaf3",
    padding: 16,
    borderRadius: 16,
    border: "1px solid #e6d8c4",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: 12,
    color: "#2c2c2c",
    fontSize: 20,
    fontWeight: 800,
  },

  filterWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 14,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 320,
    overflow: "auto",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    background: "#f7efe3",
    border: "1px solid #e6d8c4",
    gap: 12,
    flexWrap: "wrap",
  },

  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    background: "#f7efe3",
    border: "1px solid #e6d8c4",
    gap: 12,
    flexWrap: "wrap",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 10,
    borderTop: "1px solid #e6d8c4",
    color: "#2c2c2c",
  },

  small: {
    color: "#6b5d4d",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 1.5,
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#6b5d4d",
  },

  formGroup: {
    marginBottom: "14px",
  },

  field: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d8c7b0",
    background: "#fffdf9",
    color: "#2c2c2c",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    minHeight: "46px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d8c7b0",
    background: "#fffdf9",
    color: "#2c2c2c",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    minHeight: "96px",
    resize: "vertical",
  },

  qty: {
    width: 72,
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d8c7b0",
    outline: "none",
    background: "#fffdf9",
    color: "#2c2c2c",
    fontFamily: "inherit",
  },

  primaryBtn: {
    background: "#b08968",
    color: "white",
    border: "none",
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },

  smallBtn: {
    background: "#efe3cf",
    color: "#5a4630",
    border: "1px solid #d8c7b0",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  dangerBtn: {
    background: "#f2d4cf",
    color: "#8a3b46",
    border: "1px solid #e3b6ae",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
  },

  disabledBtn: {
    background: "#d8d0c4",
    color: "#7c7365",
    border: "none",
    padding: "10px 12px",
    borderRadius: 8,
  },

  badge: {
    marginLeft: 8,
    padding: "3px 8px",
    borderRadius: 999,
    background: "#dff3e2",
    color: "#2f6b3b",
    border: "1px solid #b8ddbf",
  },

  badge2: {
    marginLeft: 8,
    padding: "3px 8px",
    borderRadius: 999,
    background: "#efe1f8",
    color: "#6f4691",
    border: "1px solid #dbc2ee",
  },

  hr: {
    border: "none",
    borderTop: "1px solid #e6d8c4",
    margin: "14px 0",
  },

  menuImage: {
    width: 60,
    height: 60,
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid #e6d8c4",
  },

  itemName: {
    color: "#2c2c2c",
  },

  emptyState: {
    background: "#f7efe3",
    border: "1px solid #e6d8c4",
    borderRadius: 12,
    padding: 14,
    color: "#6b5d4d",
    fontWeight: 600,
  },
};

export default CustomerDashboard;