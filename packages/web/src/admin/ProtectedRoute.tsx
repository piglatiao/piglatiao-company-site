import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export default function ProtectedRoute() {
  const { user } = useAuth();
  const token = localStorage.getItem("admin_token");

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
