import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function Users() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    const res = await axios.get(`${API}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(res.data);
  };

  const handleBlock = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API}/api/auth/block-user/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Updated successfully");
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.heading}>👤 Users</h1>
            <p style={styles.subText}>
              Manage customers and staff access permissions.
            </p>
          </div>

          <button onClick={fetchUsers} style={styles.btn}>
            ⟳ Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div style={styles.empty}>No users found.</div>
        ) : (
          <div style={styles.grid}>
            {users
  .filter((u) => u.role !== "admin") 
  .map((u) => (
              <div key={u._id} style={styles.card}>
                
                <div style={styles.name}>{u.name}</div>
                <div style={styles.phone}>{u.email}</div>

                <div style={styles.row}>
                  Role: <b>{u.role}</b>
                </div>

                <div style={styles.row}>
                  Status:{" "}
                  <b style={{ color: u.isBlocked ? "red" : "green" }}>
                    {u.isBlocked ? "Blocked" : "Active"}
                  </b>
                </div>

                {/*  BLOCK BUTTON */}
                <button
                  style={styles.blockBtn}
                  onClick={() => handleBlock(u._id)}
                >
                  {u.isBlocked ? "Unblock" : "Block"}
                </button>

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

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  heading: {
    margin: 0,
    fontSize: "42px",
    fontWeight: 800,
  },

  subText: {
    marginTop: "8px",
    color: "#7a6f5d",
  },

  btn: {
    background: "#b08968",
    border: "none",
    color: "white",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },

  empty: {
    marginTop: 16,
    background: "#fffaf3",
    padding: 18,
    borderRadius: 16,
    border: "1px solid #e6d8c3",
  },

  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 18,
  },

  card: {
    background: "#fffaf3",
    padding: 20,
    borderRadius: 18,
    border: "1px solid #e6d8c3",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  name: {
    fontSize: 24,
    fontWeight: 800,
  },

  phone: {
    marginTop: 10,
  },

  row: {
    marginTop: 12,
  },

  blockBtn: {
    marginTop: 14,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#d9534f",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};