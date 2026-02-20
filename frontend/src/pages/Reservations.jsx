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

  //  Admin list should only be fetched by admin
  const fetchReservations = async () => {
    if (!isAdmin) return;
    try {
      const res = await axios.get(`${API}/api/reservations`, authConfig);
      setList(res.data || []);
    } catch (e) {
      console.log("Admin fetch reservations error:", e?.response?.data || e.message);
    }
  };

  useEffect(() => {
    fetchReservations();
    
  }, []);

 
  const book = async (e) => {
    e.preventDefault();
    setMessage("");

    if (isAdmin) {
      setMessage("⚠ Admin cannot book reservations from this page. Login as Customer.");
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
      <div style={{ minHeight: "100vh" }}>
        <h1>📅 Reservations</h1>

        {/* ✅ CUSTOMER BOOKING FORM (Only for non-admin) */}
        {!isAdmin && (
          <form
            onSubmit={book}
            style={{
              marginTop: 16,
              background: "#1e293b",
              padding: 16,
              borderRadius: 12,
              display: "grid",
              gap: 10,
            }}
          >
            <input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                checkAvailability(e.target.value, time);
              }}
              required
            />

            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                checkAvailability(date, e.target.value);
              }}
              required
            />

            <div>
              Booked tables:{" "}
              {bookedTables.length === 0 ? "None" : bookedTables.join(", ")}
            </div>

            {bookedTables.includes(Number(tableNo)) && (
              <div style={{ color: "#fbbf24" }}>
                ⚠ This table is already booked — will go to waiting list.
              </div>
            )}

            <input
              type="number"
              placeholder="Guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
              min={1}
            />
            <input
              type="number"
              placeholder="Table No"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              required
              min={1}
            />
            <input
              placeholder="Special Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button type="submit">Book</button>
          </form>
        )}

        {/* Message */}
        {message && <div style={{ marginTop: 10 }}>{message}</div>}

        {/* ✅ ADMIN VIEW (Only for admin) */}
        {isAdmin && (
          <>
            <h2 style={{ marginTop: 30 }}>Admin View</h2>

            {list.length === 0 ? (
              <div style={{ marginTop: 10 }}>No reservations found.</div>
            ) : (
              list.map((r) => (
                <div
                  key={r._id}
                  style={{
                    marginTop: 10,
                    padding: 10,
                    background: "#1e293b",
                    borderRadius: 10,
                  }}
                >
                  <b>{r.customerName}</b> | Table {r.tableNo ?? "-"} | {r.date}{" "}
                  {r.time} | {r.status}
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r._id, e.target.value)}
                    style={{ marginLeft: 10 }}
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Waiting</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </Layout>
  );
}