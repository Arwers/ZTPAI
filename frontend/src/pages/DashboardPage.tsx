import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
  Chip
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { Link as RouterLink } from 'react-router-dom';
import api from "../utils/api";

interface Account {
  id: number;
  name: string;
  balance: string;
  currency: {
    code: string;
    symbol: string;
  };
  account_type: {
    name: string;
  };
}

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSelectedAccount = async () => {
      // Get account ID from URL parameter first, then fallback to localStorage
      const urlAccountId = searchParams.get('acc');
      const storageAccountId = localStorage.getItem('selectedAccountId');
      const accountId = urlAccountId || storageAccountId;

      if (!accountId) {
        // No account selected, redirect to account selection
        navigate('/accounts');
        return;
      }

      try {
        // Get access token from cookie
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        // Fetch the specific account data
        const response = await api.get(`/api/accounts/${accountId}/`, {
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });

        setSelectedAccount(response.data);
        
        // Update localStorage if URL param was used
        if (urlAccountId) {
          localStorage.setItem('selectedAccountId', urlAccountId);
        }
        
        // Update URL to include account parameter if it's missing
        if (!urlAccountId && storageAccountId) {
          navigate(`/dashboard?acc=${storageAccountId}`, { replace: true });
        }

      } catch (error) {
        console.error("Error fetching account:", error);
        // If account doesn't exist or error, redirect to account selection
        localStorage.removeItem('selectedAccountId');
        navigate('/accounts');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadSelectedAccount();
    }
  }, [user, searchParams, navigate]);

  const handleSwitchAccount = () => {
    navigate('/accounts');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Function to generate random colors for avatars (same as AccountSelectionPage)
  const getRandomColor = (accountId: number) => {
    const colors = [
      '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f',
      '#0288d1', '#689f38', '#f9a825', '#512da8', '#c2185b',
      '#00796b', '#5d4037', '#455a64', '#e64a19', '#1565c0'
    ];
    return colors[accountId % colors.length];
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!selectedAccount) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default', 
    }}>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1} 
        sx={{ 
          bgcolor: 'background.paper',
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
            }}
          >
            <FontAwesomeIcon 
              icon={faChartPie} 
              style={{ fontSize: '1.5rem', marginRight: '10px' }} 
            />
            <Typography variant="h6" component="div" color="text.primary">
              Finance Tracker
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleSwitchAccount}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Switch Account
            </Button>
            <ThemeToggle />
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard - {selectedAccount.name}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Current Balance
                </Typography>
                <Typography variant="h4" component="div">
                  {selectedAccount.currency?.symbol}{selectedAccount.balance}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAccount.account_type?.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Add more dashboard content here */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transaction history will be displayed here...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
