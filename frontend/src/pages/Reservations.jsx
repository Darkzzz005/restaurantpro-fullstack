import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

export default function Reservations() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isAdmin = user?.role === "admin";

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [tableNo, setTableNo] = useState(1);
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [bookedTables, setBookedTables] = useState([]);
  const [list, setList] = useState([]);

  const token = localStorage.getItem("token");
  const authConfig = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #dbcdb8",
    outline: "none",
    backgroundColor: "#fffdf9",
    color: "#2c2c2c",
    fontSize: "14px",
  };

  const checkAvailability = async (d, t) => {
    if (!d || !t) return;
    try {
      const res = await axios.get(
        `${API}/api/reservations/availability?date=${d}&time=${t}`
      );
      setBookedTables(res.data.bookedTables || []);
    } catch (e) {
      setBookedTables([]);
      console.log("Availability error:", e?.response?.data || e.message);
    }
  };

  const fetchReservations = async () => {
    if (!isAdmin) return;
    try {
      const res = await axios.get(`${API}/api/reservations`, authConfig);
      setList(res.data || []);
    } catch (e) {
      console.log(
        "Admin fetch reservations error:",
        e?.response?.data || e.message
      );
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const book = async (e) => {
    e.preventDefault();
    setMessage("");

    if (isAdmin) {
      setMessage(
        "⚠ Admin cannot book reservations from this page. Login as Customer."
      );
      return;
    }

    if (!token) {
      setMessage("⚠ Please login as Customer to book.");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/reservations`,
        {
          customerName,
          phone,
          date,
          time,
          guests: Number(guests),
          tableNo: Number(tableNo),
          notes,
        },
        authConfig
      );

      setMessage(`✅ Booking created! Status: ${res.data.status}`);
      setCustomerName("");
      setPhone("");
      setGuests(2);
      setTableNo(1);
      setNotes("");
      setBookedTables([]);
    } catch (e) {
      setMessage(e?.response?.data?.message || "❌ Booking failed");
    }
  };

  const updateStatus = async (id, status) => {
    if (!isAdmin) return;

    try {
      await axios.patch(
        `${API}/api/reservations/${id}/status`,
        { status },
        authConfig
      );
      fetchReservations();
    } catch (e) {
      console.log("Update status error:", e?.response?.data || e.message);
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📅 Reservations</h1>
            <p style={styles.subtitle}>
              {isAdmin
                ? "Manage and update customer reservation statuses."
                : "Book a table and check table availability."}
            </p>
          </div>
        </div>

        {!isAdmin && (
          <form onSubmit={book} style={styles.formCard}>
            <h3 style={styles.cardHeading}>Book a Table</h3>

            <div style={styles.formGrid}>
              <input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={inputStyle}
              />

              <input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  checkAvailability(e.target.value, time);
                }}
                required
                style={inputStyle}
              />

              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  checkAvailability(date, e.target.value);
                }}
                required
                style={inputStyle}
              />

              <input
                type="number"
                placeholder="Guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
                min={1}
                style={inputStyle}
              />

              <input
                type="number"
                placeholder="Table No"
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
                required
                min={1}
                style={inputStyle}
              />

              <input
                placeholder="Special Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ ...inputStyle, gridColumn: "1 / -1" }}
              />
            </div>

            <div style={styles.infoBox}>
              <strong>Booked tables:</strong>{" "}
              {bookedTables.length === 0 ? "None" : bookedTables.join(", ")}
            </div>

            {bookedTables.includes(Number(tableNo)) && (
              <div style={styles.warningBox}>
                ⚠ This table is already booked — it will go to the waiting list.
              </div>
            )}

            <button type="submit" style={styles.primaryButton}>
              Book Reservation
            </button>
          </form>
        )}

        {message && <div style={styles.messageBox}>{message}</div>}

        {isAdmin && (
          <>
            <div style={styles.adminHeading}>Admin View</div>

            {list.length === 0 ? (
              <div style={styles.emptyState}>No reservations found.</div>
            ) : (
              <div style={styles.listWrap}>
                {list.map((r) => (
                  <div key={r._id} style={styles.reservationCard}>
                    <div style={styles.reservationInfo}>
                      <div style={styles.customerName}>{r.customerName}</div>
                      <div style={styles.metaText}>
                        Table {r.tableNo ?? "-"} | {r.date} {r.time}
                      </div>
                      <div style={styles.statusLine}>
                        Current Status:{" "}
                        <span style={styles.statusBadge}>{r.status}</span>
                      </div>
                    </div>

                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                      style={styles.select}
                    >
                      <option>Pending</option>
                      <option>Confirmed</option>
                      <option>Waiting</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </>
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
  header: {
    marginBottom: "22px",
  },
  title: {
    margin: 0,
    fontSize: "42px",
    fontWeight: 800,
    color: "#2c2c2c",
  },
  subtitle: {
    marginTop: "8px",
    color: "#7a6f5d",
    fontSize: "15px",
  },
  formCard: {
    background: "#fffaf3",
    border: "1px solid #e6d8c3",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cardHeading: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 800,
    color: "#2c2c2c",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  infoBox: {
    background: "#f3ebdf",
    border: "1px solid #e6d8c3",
    color: "#5f5448",
    padding: "12px 14px",
    borderRadius: "12px",
  },
  warningBox: {
    background: "#f7e4b5",
    border: "1px solid #e2c979",
    color: "#6d5621",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 600,
  },
  messageBox: {
    marginTop: "16px",
    background: "#fffaf3",
    border: "1px solid #e6d8c3",
    color: "#5f5448",
    padding: "14px 16px",
    borderRadius: "12px",
    fontWeight: 600,
  },
  primaryButton: {
    alignSelf: "flex-start",
    padding: "12px 18px",
    background: "#b08968",
    border: "none",
    color: "white",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  adminHeading: {
    marginTop: "26px",
    marginBottom: "14px",
    fontSize: "28px",
    fontWeight: 800,
    color: "#2c2c2c",
  },
  emptyState: {
    background: "#fffaf3",
    border: "1px solid #e6d8c3",
    borderRadius: "16px",
    padding: "18px",
    color: "#7a6f5d",
    fontWeight: 600,
  },
  listWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  reservationCard: {
    background: "#fffaf3",
    border: "1px solid #e6d8c3",
    borderRadius: "16px",
    padding: "16px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },
  reservationInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  customerName: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#2c2c2c",
  },
  metaText: {
    color: "#6f6657",
  },
  statusLine: {
    color: "#5f5448",
    fontWeight: 600,
  },
  statusBadge: {
    background: "#eadcc6",
    color: "#6a5237",
    padding: "4px 10px",
    borderRadius: "999px",
    marginLeft: "6px",
    fontWeight: 700,
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