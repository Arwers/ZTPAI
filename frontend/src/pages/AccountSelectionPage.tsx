import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
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

interface AccountType {
  id: number;
  name: string;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

const AccountSelectionPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: "0",
    currency_id: "",
    account_type_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Make sure to destructure refreshToken from useAuth
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Update useEffect to correctly handle authentication headers
  useEffect(() => {
    // Don't fetch anything if there's no user
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Log cookies for debugging
        console.log("Current cookies:", document.cookie);
        
        // First get types and currencies
        try {
          const typesRes = await api.get('/api/accounts/types/');
          const currenciesRes = await api.get('/api/accounts/currencies/');
          
          setAccountTypes(typesRes.data || []);
          setCurrencies(currenciesRes.data || []);
        } catch (refError) {
          console.error("Error fetching reference data:", refError);
          // Continue even if reference data fails
        }
        
        // Get accounts with explicit token
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];
        
        console.log("Found access token:", accessToken ? "Yes" : "No");
        
        // Make the accounts API call with explicit token
        const accountsResponse = await api.get('/api/accounts/', {
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });
        
        console.log("Accounts response:", accountsResponse.data);
        setAccounts(accountsResponse.data || []);

      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]); // Only depend on user

  // Modify the handleCreateAccount function to prevent refresh
  const handleCreateAccount = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any default form submission behavior
    e.preventDefault();
    
    if (!newAccount.name || !newAccount.currency_id || !newAccount.account_type_id) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Get access token from cookie
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
      // Set up request data and headers
      const accountData = {
        name: newAccount.name,
        balance: parseFloat(newAccount.balance) || 0,
        currency_id: parseInt(newAccount.currency_id),
        account_type_id: parseInt(newAccount.account_type_id)
      };
      
      const headers = {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json'
      };
      
      // Make the API request with explicit headers
      const response = await api.post('/api/accounts/', accountData, {
        headers,
        withCredentials: true
      });
      
      // Reset form and close dialog
      setOpenDialog(false);
      setNewAccount({ name: "", balance: "0", currency_id: "", account_type_id: "" });
      
      // Update state with the new account in a way that doesn't cause a full re-render
      setAccounts(prevAccounts => [...prevAccounts, response.data]);
    } catch (error) {
      console.error("Error creating account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSelect = (accountId: number) => {
    localStorage.setItem('selectedAccountId', accountId.toString());
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Dialog for creating a new account - show fallback messages if reference data is missing
  const renderDialog = () => (
    <Dialog 
      open={openDialog} 
      onClose={() => setOpenDialog(false)} 
      maxWidth="sm" 
      fullWidth
      disableRestoreFocus
    >
      <DialogTitle>Create New Account</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate onSubmit={(e) => e.preventDefault()}>
          <TextField
            fullWidth
            label="Account Name"
            margin="normal"
            value={newAccount.name}
            onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Initial Balance"
            type="number"
            margin="normal"
            value={newAccount.balance}
            onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
            required
          />
          
          {currencies.length === 0 ? (
            <Box sx={{ my: 2, p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}>
              <Typography color="warning.main">
                No currencies available. Please contact an administrator.
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              select
              label="Currency"
              margin="normal"
              value={newAccount.currency_id}
              onChange={(e) => setNewAccount({ ...newAccount, currency_id: e.target.value })}
              required
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.id} value={currency.id.toString()}>
                  {currency.code} - {currency.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          
          {accountTypes.length === 0 ? (
            <Box sx={{ my: 2, p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}>
              <Typography color="warning.main">
                No account types available. Please contact an administrator.
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              select
              label="Account Type"
              margin="normal"
              value={newAccount.account_type_id}
              onChange={(e) => setNewAccount({ ...newAccount, account_type_id: e.target.value })}
              required
            >
              {accountTypes.map((type) => (
                <MenuItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={() => setOpenDialog(false)}>Cancel</Button>
        <Button 
          type="button" // Explicitly set to button type
          onClick={handleCreateAccount} 
          variant="contained" 
          disabled={
            isSubmitting || 
            !newAccount.name || 
            currencies.length === 0 || 
            accountTypes.length === 0 || 
            !newAccount.currency_id || 
            !newAccount.account_type_id
          }
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Add maximum account limit
  const MAX_ACCOUNTS = 4;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default', 
      color: 'text.primary',
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

      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: 6,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" gutterBottom fontWeight="bold" color="text.primary">
            Who's managing finances today?
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Select an account or create a new one
          </Typography>
        </Box>

        {/* Display a message if there are no accounts */}
        {accounts.length === 0 && !isLoading ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              my: 4, 
              p: 4, 
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You don't have any accounts yet
            </Typography>
            <Typography color="text.secondary">
              Click the "Create New Account" button below to get started
            </Typography>
          </Box>
        ) : null}

        <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
          {/* Render accounts if available */}
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={account.id}>
              <Card 
                sx={{ 
                  height: 230,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6
                  },
                  bgcolor: 'background.paper'
                }}
              >
                <CardActionArea 
                  onClick={() => handleAccountSelect(account.id)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
                >
                  <Avatar 
                    sx={{ 
                      width: 84, 
                      height: 84, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: 'primary.main' 
                    }}
                  >
                    <AccountBalanceIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 1
                  }}>
                    <Typography variant="h5" component="div" gutterBottom fontWeight="medium">
                      {account.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {account.account_type?.name || 'Account'}
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ mt: 'auto' }}>
                      {account.currency?.symbol}{account.balance}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}

          {/* Add new account card - only show if below account limit */}
          {accounts.length < MAX_ACCOUNTS && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: 230,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'divider',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 3,
                    borderColor: 'primary.main',
                  },
                  bgcolor: 'background.paper'
                }}
              >
                <CardActionArea 
                  onClick={() => setOpenDialog(true)}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    p: 2,
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 84, 
                      height: 84, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: 'action.selected'
                    }}
                  >
                    <AddIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 1
                  }}>
                    <Typography 
                      variant="h5" 
                      component="div" 
                      gutterBottom 
                      fontWeight="medium" 
                      color="primary"
                    >
                      New Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create a new financial profile
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Create Account Dialog */}
        {renderDialog()}
      </Container>
    </Box>
  );
};

export default AccountSelectionPage;
