import { Container, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
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
