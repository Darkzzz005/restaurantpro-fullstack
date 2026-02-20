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

      // save token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user?.role;

      // role-based redirect
      if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "staff") {
        navigate("/staff");
      } else {
        navigate("/customer");
      }

    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    }
  };


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>RestaurantPro</h2>

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
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
  title: {
    color: "white",
    textAlign: "center",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: "10px",
    textAlign: "center",
  },
};

export default Login;
