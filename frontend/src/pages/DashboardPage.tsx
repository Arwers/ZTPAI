import { Container, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all tokens from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    // Redirect to login page
    navigate("/");
  };

  return (
    <Container maxWidth="xl" sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      {/* Dashboard content will go here */}
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardPage;
