import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRole?: "admin" | "user";
}

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  // Check if user is authenticated
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    // User is not authenticated, redirect to login
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole) {
    try {
      // Decode the JWT token to extract user information
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      
      // Check for admin role if required
      if (requiredRole === "admin" && tokenPayload.user_id != 2) {
        // User is not an admin
        return <Navigate to="/dashboard" replace />;
      }
    } catch (err) {
      // Token is invalid or couldn't be decoded
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      return <Navigate to="/" replace />;
    }
  }
  
  return element;
};

export default ProtectedRoute;
