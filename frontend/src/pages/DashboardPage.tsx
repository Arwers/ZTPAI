import { Container, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout/");
      navigate("/");
    } catch (error) {
      // Even if logout fails, redirect to login
      navigate("/");
    }
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
