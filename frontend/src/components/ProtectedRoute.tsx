import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Container } from "@mui/material";

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRole?: "staff" | "user";
}

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Simple loading indicator instead of skeleton
  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // User is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requiredRole && ((user.is_staff ? "staff" : "user") !== requiredRole)) {
    if (user.is_staff) {
      return <Navigate to="/admin-panel" replace />;
    } else {
      // For regular users who don't meet role requirements, redirect to accounts
      return <Navigate to="/accounts" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
