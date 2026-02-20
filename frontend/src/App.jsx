import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddMenu from "./pages/AddMenu";
import MenuList from "./pages/MenuList";
import Menu from "./Menu";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Reservations from "./pages/Reservations";
import UserDetails from "./pages/UserDetails";
import CustomerOrders from "./pages/CustomerOrders";

import StaffDashboard from "./pages/StaffDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

import StaffAdmin from "./pages/StaffAdmin";
import StaffAttendanceAdmin from "./pages/StaffAttendanceAdmin";
import StaffAssignTaskAdmin from "./pages/StaffAssignTaskAdmin";


// ----------------- Helpers -----------------

const getToken = () => localStorage.getItem("token");

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const RequireRole = ({ role, children }) => {
  const token = getToken();
  const user = getUser();

  if (!token) return <Navigate to="/" replace />;
  if (!user || !user.role) return <Navigate to="/" replace />;

  if (user.role !== role) {
    if (user.role === "admin") return <Navigate to="/dashboard" replace />;
    if (user.role === "staff") return <Navigate to="/staff" replace />;
    return <Navigate to="/customer" replace />;
  }

  return children;
};

// ----------------- App -----------------

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <RequireRole role="admin">
              <Dashboard />
            </RequireRole>
          }
        />
        <Route
          path="/add-menu"
          element={
            <RequireRole role="admin">
              <AddMenu />
            </RequireRole>
          }
        />
        <Route
          path="/menu-list"
          element={
            <RequireRole role="admin">
              <MenuList />
            </RequireRole>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireRole role="admin">
              <Orders />
            </RequireRole>
          }
        />
        <Route
          path="/users"
          element={
            <RequireRole role="admin">
              <Users />
            </RequireRole>
          }
        />
        <Route
          path="/users/:name"
          element={
            <RequireRole role="admin">
              <UserDetails />
            </RequireRole>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireRole role="admin">
              <Settings />
            </RequireRole>
          }
        />
        <Route
          path="/reservations"
          element={
            <RequireRole role="admin">
              <Reservations />
            </RequireRole>
          }
        />

        {/* Staff Route */}
        <Route
          path="/staff"
          element={
            <RequireRole role="staff">
              <StaffDashboard />
            </RequireRole>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <RequireRole role="customer">
              <CustomerDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/my-orders"
          element={
            <RequireRole role="customer">
              <CustomerOrders />
            </RequireRole>
          }
        />

        <Route
  path="/staff-admin"
  element={
    <RequireRole role="admin">
      <StaffAdmin />
    </RequireRole>
  }
/>

<Route
  path="/staff-admin/assign"
  element={
    <RequireRole role="admin">
      <StaffAssignTaskAdmin />
    </RequireRole>
  }
/>

<Route
  path="/staff-admin/attendance"
  element={
    <RequireRole role="admin">
      <StaffAttendanceAdmin />
    </RequireRole>
  }
/>


        {/* Public route (optional) */}
        <Route path="/menu" element={<Menu />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
