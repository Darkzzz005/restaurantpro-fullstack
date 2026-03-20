import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#2c2c2c",
    fontWeight: 600,
    background: isActive ? "#d9cbb3" : "transparent",
    border: "1px solid #e5dccb",
  });

  return (
    <div style={styles.sidebar}>
      <div style={styles.brand}>🍽 RestaurantPro</div>

      <div style={styles.links}>
        <NavLink to="/dashboard" style={linkStyle}> Overview</NavLink>
        <NavLink to="/menu" style={linkStyle}> Menu</NavLink>
        <NavLink to="/orders" style={linkStyle}> Orders</NavLink>
        <NavLink to="/reservations" style={linkStyle}> Reservations</NavLink>
        <NavLink to="/users" style={linkStyle}> Users</NavLink>

        <div style={styles.sectionTitle}>Staff Management</div>

        <NavLink to="/staff-admin" style={linkStyle}> Staff List</NavLink>
        <NavLink to="/staff-admin/assign" style={linkStyle}> Assign Work</NavLink>
        <NavLink to="/staff-admin/attendance" style={linkStyle}> Attendance</NavLink>
      </div>

      <button onClick={logout} style={styles.logout}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "230px",
    minWidth: "230px",
    height: "100vh",
    position: "sticky",
    top: 0,
    background: "#ede6d6",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    borderRight: "1px solid #e5dccb",
  },

  brand: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#2c2c2c",
  },

  links: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  sectionTitle: {
    marginTop: "12px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#8b7a5e",
    textTransform: "uppercase",
  },

  logout: {
    marginTop: "auto",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#c49a6c",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
};