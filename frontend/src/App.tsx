import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AccountSelectionPage from "./pages/AccountSelectionPage"; // Import the new page
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanelPage from "./pages/AdminPanelPage";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider as CustomThemeProvider } from "./contexts/ThemeContext";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import colors from "./theme/colors";

const NoRedirectWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    sessionStorage.setItem('preventRedirect', 'true');
    
    return () => {
      sessionStorage.removeItem('preventRedirect');
    };
  }, []);
  
  return <>{children}</>;
};

const ThemedApp = () => {
  const { mode } = useTheme();
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
            {/* Add the account selection route */}
            <Route 
              path="/accounts" 
              element={<ProtectedRoute element={<AccountSelectionPage />} requiredRole="user" />} 
            />
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
