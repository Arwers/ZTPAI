import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Container } from "@mui/material";

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRole?: "staff" | "user";
}

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && ((user.is_staff ? "staff" : "user") !== requiredRole)) {
    if (user.is_staff) {
      return <Navigate to="/admin-panel" replace />;
    } else {
      return <Navigate to="/accounts" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
