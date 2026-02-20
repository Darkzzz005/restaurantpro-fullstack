import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 20 }}>
        {children}
      </div>
    </div>
  );
}
