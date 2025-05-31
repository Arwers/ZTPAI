import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api";

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRole?: "staff" | "user";
}

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<"staff" | "user" | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/auth/me/');
        setIsAuthenticated(true);
        setUserRole(response.data.is_staff ? "staff" : "user");
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // User is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check role requirements
  if (requiredRole && userRole !== requiredRole) {
    if (userRole === "staff") {
      // Staff users should go to admin panel page
      return <Navigate to="/admin-panel" replace />;
    } else {
      // Regular users go to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
