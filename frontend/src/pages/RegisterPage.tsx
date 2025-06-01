import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
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
import ThemeToggle from "../components/ThemeToggle";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faChartPie } from '@fortawesome/free-solid-svg-icons';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [themeChanged, setThemeChanged] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/api/users/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // After successful registration, log the user in automatically
      try {
        const { login } = useAuth();
        const result = await login(formData.username, formData.password);
        
        if (result) {
          // Redirect to accounts page
          navigate('/accounts', { replace: true });
          return;
        }
      } catch (loginErr) {
        console.error("Auto-login failed after registration", loginErr);
      }
      
      // If auto-login fails, just redirect to login page
      navigate("/login");
    } catch (err: any) {
      // Handle different error types
      if (err.response && err.response.data) {
        // Django REST framework typically returns errors in this format
        const serverErrors = err.response.data;
        const errorMessages = [];
        
        // Extract error messages
        for (const key in serverErrors) {
          if (Array.isArray(serverErrors[key])) {
            errorMessages.push(`${key}: ${serverErrors[key].join(", ")}`);
          } else {
            errorMessages.push(`${key}: ${serverErrors[key]}`);
          }
        }
        
        setError(errorMessages.join("; "));
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom theme toggle handler
  const handleThemeToggle = () => {
    setThemeChanged(true);
  };

  // Show loading only during form submission
  if (isSubmitting) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'background-color 0.3s ease', 
    }}>
      {/* Header bar with icon and title */}
      <AppBar position="sticky" color="default" elevation={1} sx={{ transition: 'background-color 0.3s ease' }}>
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
          <ThemeToggle onToggle={handleThemeToggle} />
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
          py: { xs: 4, md: 0 }, // Add padding for mobile
          px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            width: "100%", 
            maxWidth: 400, 
            textAlign: "center",
            transition: 'background-color 0.3s ease' // For smooth theme transitions
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' } }} gutterBottom>
            Register
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              margin="normal"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ 
                mt: 2,
                py: { xs: 1.5, sm: 2 }, // Taller button on mobile for better touch target
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Register
            </Button>
            <Box mt={2}>
              <Typography variant="body2">
                Already have an account? <Link to="/login">Login</Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
