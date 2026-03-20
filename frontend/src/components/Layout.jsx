import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.mainContent}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f7f3ea", // main beige background
  },

  mainContent: {
    flex: 1,
    padding: "28px",
    background: "#f7f3ea",
  },
};