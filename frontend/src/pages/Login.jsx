import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user?.role;

      if (role === "admin") navigate("/dashboard");
      else if (role === "staff") navigate("/staff");
      else navigate("/customer");

    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>RestaurantPro</h2>
        <p style={styles.subtitle}>Restaurant Management System</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {

  container:{
    height:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    background:"#f7f3ea",
  },

  card:{
    background:"#fffaf3",
    padding:"40px",
    borderRadius:"16px",
    width:"360px",
    border:"1px solid #e6d8c4",
    boxShadow:"0 10px 25px rgba(0,0,0,0.06)",
  },

  title:{
    textAlign:"center",
    marginBottom:"6px",
    fontSize:"28px",
    fontWeight:"800",
    color:"#2c2c2c"
  },

  subtitle:{
    textAlign:"center",
    fontSize:"14px",
    color:"#7a6f5d",
    marginBottom:"22px"
  },

  input:{
    width:"100%",
    padding:"12px 14px",
    marginBottom:"14px",
    borderRadius:"10px",
    border:"1px solid #e6d8c4",
    fontSize:"14px",
    outline:"none",
    boxSizing:"border-box",
    background:"#ffffff"
  },

  button:{
    width:"100%",
    padding:"12px",
    background:"#b08968",
    color:"white",
    border:"none",
    borderRadius:"10px",
    cursor:"pointer",
    fontWeight:"700",
    fontSize:"15px"
  },

  error:{
    color:"#b91c1c",
    marginBottom:"12px",
    textAlign:"center",
    fontWeight:"600"
  }

};

export default Login;