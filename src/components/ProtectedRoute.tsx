import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <p>Loading auth...</p>;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }


  return <Outlet />;
}
