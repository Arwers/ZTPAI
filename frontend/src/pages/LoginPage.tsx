import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert, 
  Box,
  CircularProgress,
  AppBar,
  Toolbar
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      const result = await login(username, password);
      
      // Only navigate if login was successful
      if (result && result.user_id) {
        if (result.is_staff) {
          navigate('/admin-panel', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      // Set error message but stay on login page
      setLoginError(error || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show loading spinner when actively submitting the form
  const showSpinner = isSubmitting;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'background-color 0.3s ease',
      bgcolor: 'background.default',
    }}>
      {/* Header bar with icon and title */}
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1} 
        sx={{ 
          transition: 'background-color 0.3s ease',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon 
              icon={faChartPie} 
              style={{ fontSize: '1.5rem', marginRight: '10px' }} 
            />
            <Typography variant="h6" component="div">
              Finance Tracker
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="sm" 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          flexGrow: 1,
          py: { xs: 4, md: 0 },
          px: { xs: 2, sm: 3, md: 4 },
          bgcolor: 'background.default',
          transition: 'background-color 0.3s ease',
        }} 
        className="page-container"
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: { xs: 2, sm: 3, md: 4 },
            width: "100%", 
            maxWidth: 400, 
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' } }} gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={showSpinner}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={showSpinner}
            />
            {(loginError || error) && (
              <Alert severity="error" sx={{ my: 2 }}>
                {loginError || error}
              </Alert>
            )}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              disabled={isSubmitting}
              sx={{ 
                mt: 2,
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                minHeight: 48 // Ensure consistent height with/without spinner
              }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Login"}
            </Button>
            <Box mt={2}>
              <Typography variant="body2">
                Don't have an account? <Link to="/register">Register</Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
