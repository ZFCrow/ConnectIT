import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth }          from "@/contexts/AuthContext";

export default function PublicRoute() {
  const { role, isLoading } = useAuth();

  // 1. Still waiting on the /api/me check?  
  if (isLoading) {
    return <div>Loading…</div>;
  }

  // 2. If they’re already logged in (role ≠ null), bounce to homepage  
  if (role) {
    return <Navigate to="/" replace />;
  }

  // 3. Otherwise render the login/register child route  
  return <Outlet />;
}
