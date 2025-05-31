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
  Box
} from "@mui/material";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/api/users/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Registration successful, redirect to login
      navigate("/");
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
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh" 
    }}>
      <Paper elevation={3} sx={{ padding: 4, width: "100%", maxWidth: 400, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
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
            sx={{ mt: 2 }}
          >
            Register
          </Button>
          <Box mt={2}>
            <Typography variant="body2">
              Already have an account? <Link to="/">Login</Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
