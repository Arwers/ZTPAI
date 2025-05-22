import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Container, TextField, Button, Typography, Paper, Alert, Box } from "@mui/material";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        // Decode the token
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (tokenPayload.exp && tokenPayload.exp > currentTime) {
          // Token is valid, redirect based on role
          if (tokenPayload.user_id == 2) {
            navigate("/adminPanel");
          } else {
            navigate("/dashboard");
          }
        } else {
          // Token is expired, clear storage
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
        }
      } catch (err) {
        // Token is invalid, clear storage
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      }
    }
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        username,
        password,
      });

      localStorage.setItem("authToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      
      // Decode the JWT token to extract user information
      const tokenPayload = JSON.parse(atob(response.data.access.split('.')[1]));
      
      // Check if user is admin/staff and navigate accordingly
      if (tokenPayload.user_id == 2) {
        navigate("/adminPanel");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <Paper elevation={3} sx={{ padding: 4, width: "100%", maxWidth: 400, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
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
          />
          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
          <Box mt={2}>
            <Typography variant="body2">
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
