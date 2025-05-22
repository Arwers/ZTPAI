import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/adminPanel" 
          element={<ProtectedRoute element={<AdminPanelPage />} requiredRole="admin" />} 
        />
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute element={<DashboardPage />} requiredRole="user" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
