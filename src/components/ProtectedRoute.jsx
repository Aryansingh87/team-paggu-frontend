import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ProtectedRoute — redirects to /login if not authenticated, or to the
 * correct dashboard if the user's role doesn't match what this route needs.
 * Usage: <Route path="/coach" element={<ProtectedRoute role="coach"><CoachDashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "coach" ? "/coach" : "/dashboard"} replace />;
  }
  return children;
}
