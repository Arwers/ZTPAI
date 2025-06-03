import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Link as RouterLink } from 'react-router-dom';

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
      console.log('Login form submitted');
      const result = await login(username, password);
      
      // Only navigate if login was successful
      if (result && result.user_id) {
        console.log('Login successful, redirecting...');
        // Check if user has admin privileges and redirect accordingly
        navigate('/accounts', { replace: true });
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      // Set error message but stay on login page
      setLoginError(error || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show loading spinner when actively submitting the form
  const showSpinner = isSubmitting;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Header bar with icon and title */}
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1} 
        sx={{ 
          bgcolor: 'background.paper',
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <Toolbar>
          <Box 
            component={RouterLink} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none', 
              color: 'inherit',
              transition: 'color 0.3s ease',
            }}
          >
            <FontAwesomeIcon 
              icon={faChartPie} 
              style={{ fontSize: '1.5rem', marginRight: '10px' }} 
            />
            <Typography variant="h6" component="div" color="text.primary" sx={{ transition: 'color 0.3s ease' }}>
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
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'border-color 0.3s ease, background-color 0.3s ease',
                },
                '& .MuiInputLabel-root': {
                  transition: 'color 0.3s ease',
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'border-color 0.3s ease, background-color 0.3s ease',
                },
                '& .MuiInputLabel-root': {
                  transition: 'color 0.3s ease',
                },
              }}
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
                minHeight: 48, // Ensure consistent height with/without spinner
                transition: 'all 0.3s ease',
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
