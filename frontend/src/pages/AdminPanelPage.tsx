import { Container, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Container maxWidth="xl" sx={{ minHeight: '100vh' }}>
      {/* Admin panel content will go here */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 2 }}>
        <ThemeToggle />
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

export default AdminPanelPage;
