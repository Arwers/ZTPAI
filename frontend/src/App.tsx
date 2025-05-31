import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanelPage from "./pages/AdminPanelPage";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider as CustomThemeProvider } from "./contexts/ThemeContext";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import colors from "./theme/colors";

// Custom navigation guard to prevent redirect on login errors
const LoginGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, error, isLoading } = useAuth();
  
  // If there's a login error, always render the children (login page)
  if (error || location.pathname === '/login') {
    return <>{children}</>;
  }
  
  // Regular behavior - redirect if already authenticated
  if (user && !isLoading && location.pathname === '/login') {
    if (user.is_staff) {
      return <Navigate to="/admin-panel" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

// Add a component that prevents automatic redirects
const NoRedirectWrapper = ({ children }: { children: React.ReactNode }) => {
  const { loginFailed } = useAuth();
  
  // Use session storage to track that we're on login page
  useEffect(() => {
    sessionStorage.setItem('preventRedirect', 'true');
    
    return () => {
      sessionStorage.removeItem('preventRedirect');
    };
  }, []);
  
  return <>{children}</>;
};

// Theme wrapper that consumes our ThemeContext
const ThemedApp = () => {
  const { mode } = useTheme();
  
  // Create theme with our custom colors based on current mode
  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: colors.brand.primary,
      },
      secondary: {
        main: colors.brand.secondary,
      },
      error: {
        main: colors.brand.error,
      },
      warning: {
        main: colors.brand.warning,
      },
      info: {
        main: colors.brand.info,
      },
      success: {
        main: colors.brand.success,
      },
      background: {
        default: colors[mode].background.primary,
        paper: colors[mode].background.secondary,
      },
      text: {
        primary: colors[mode].text.primary,
        secondary: colors[mode].text.secondary,
      },
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <NoRedirectWrapper>
                <LoginPage />
              </NoRedirectWrapper>
            } />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute element={<DashboardPage />} requiredRole="user" />} 
            />
            <Route 
              path="/admin-panel" 
              element={<ProtectedRoute element={<AdminPanelPage />} requiredRole="staff" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <CustomThemeProvider>
      <ThemedApp />
    </CustomThemeProvider>
  );
}

export default App;
