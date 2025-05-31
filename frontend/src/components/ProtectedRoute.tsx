import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRole?: "staff" | "user";
}

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  
  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // User is not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role requirements
  if (requiredRole && ((user.is_staff ? "staff" : "user") !== requiredRole)) {
    if (user.is_staff) {
      return <Navigate to="/admin-panel" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
