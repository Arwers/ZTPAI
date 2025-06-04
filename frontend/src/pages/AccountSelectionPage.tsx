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
  Avatar,
  IconButton,
  Tooltip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const typesRes = await api.get('/api/accounts/types/');
        const currenciesRes = await api.get('/api/accounts/currencies/');
          
        setAccountTypes(typesRes.data || []);
        setCurrencies(currenciesRes.data || []);
        
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];
        
        const accountsResponse = await api.get('/api/accounts/', {
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });
        
        setAccounts(accountsResponse.data || []);

      } catch (error) {
        setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);


  const handleCreateAccount = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!newAccount.name || !newAccount.currency_id || !newAccount.account_type_id) {
      return;
    }

    setIsSubmitting(true);
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
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
      
      const response = await api.post('/api/accounts/', accountData, {
        headers,
        withCredentials: true
      });
      
      setOpenDialog(false);
      setNewAccount({ name: "", balance: "0", currency_id: "", account_type_id: "" });
      
      setAccounts(prevAccounts => [...prevAccounts, response.data]);
    } catch (error) {
      console.error("Error creating account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSelect = (accountId: number) => {
    localStorage.setItem('selectedAccountId', accountId.toString());
    navigate(`/dashboard?acc=${accountId}`);
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [editedAccount, setEditedAccount] = useState({
    name: "",
    balance: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (account: Account) => {
    setAccountToEdit(account);
    setEditedAccount({
      name: account.name,
      balance: account.balance
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    if (!accountToEdit) return;
    
    setAccountToDelete(accountToEdit);
    setDeleteDialogOpen(true);
  };

  const handleUpdateAccount = async () => {
    if (!accountToEdit) return;
    
    setIsEditing(true);
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
      const headers = {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json'
      };
      
      const response = await api.patch(`/api/accounts/${accountToEdit.id}/`, {
        name: editedAccount.name,
        balance: parseFloat(editedAccount.balance) || 0
      }, {
        headers,
        withCredentials: true
      });
      
      setAccounts(prevAccounts => 
        prevAccounts.map(account => 
          account.id === accountToEdit.id ? response.data : account
        )
      );
      
      // Close the edit dialog
      setEditDialogOpen(false);
      setAccountToEdit(null);
    } catch (error) {
      console.error("Error updating account:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    setIsDeleting(true);
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
      const headers = {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json'
      };
      
      await api.delete(`/api/accounts/${accountToDelete.id}/`, {
        headers,
        withCredentials: true
      });
      
      setAccounts(prevAccounts => 
        prevAccounts.filter(account => account.id !== accountToDelete.id)
      );
      
      const selectedAccountId = localStorage.getItem('selectedAccountId');
      if (selectedAccountId === accountToDelete.id.toString()) {
        localStorage.removeItem('selectedAccountId');
      }
      
      setDeleteDialogOpen(false);
      setEditDialogOpen(false);
      setAccountToDelete(null);
      setAccountToEdit(null);
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDialog = () => (
    <Dialog 
      open={openDialog} 
      onClose={() => setOpenDialog(false)} 
      maxWidth="sm" 
      fullWidth
      disableRestoreFocus
    >
      <DialogTitle>Create New Profile</DialogTitle>
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
            label="Spending limit"
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
              label="Type"
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
          type="button"
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
          {isSubmitting ? <CircularProgress size={24} /> : 'Create Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderEditDialog = () => (
    <Dialog 
      open={editDialogOpen} 
      onClose={() => setEditDialogOpen(false)}
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate onSubmit={(e) => e.preventDefault()}>
          <TextField
            fullWidth
            label="Profile Name"
            margin="normal"
            value={editedAccount.name}
            onChange={(e) => setEditedAccount({ ...editedAccount, name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Balance"
            type="number"
            margin="normal"
            value={editedAccount.balance}
            onChange={(e) => setEditedAccount({ ...editedAccount, balance: e.target.value })}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          color="error"
          onClick={handleDeleteClick}
          disabled={isEditing}
          startIcon={<DeleteIcon />}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Delete profile
        </Button>
        <IconButton
          color="error"
          onClick={handleDeleteClick}
          disabled={isEditing}
          sx={{ display: { xs: 'flex', sm: 'none' } }}
        >
          <DeleteIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={() => setEditDialogOpen(false)} disabled={isEditing}>
          Cancel
        </Button>
        <Button 
          onClick={handleUpdateAccount} 
          variant="contained" 
          disabled={isEditing || !editedAccount.name}
        >
          {isEditing ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDeleteConfirmDialog = () => (
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
      <DialogTitle>Delete Account</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the account "{accountToDelete?.name}"?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          This action cannot be undone. All transactions related to this account will also be deleted.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
          Cancel
        </Button>
        <Button 
          onClick={handleDeleteAccount} 
          color="error" 
          variant="contained"
          disabled={isDeleting}
        >
          {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const MAX_ACCOUNTS = 4;

  const getRandomColor = (accountId: number) => {
    const colors = [
      '#1976d2', // blue
      '#388e3c', // green
      '#f57c00', // orange
      '#7b1fa2', // purple
      '#d32f2f', // red
      '#0288d1', // light blue
      '#689f38', // light green
      '#f9a825', // yellow
      '#512da8', // deep purple
      '#c2185b', // pink
      '#00796b', // teal
      '#5d4037', // brown
      '#455a64', // blue grey
      '#e64a19', // deep orange
      '#1565c0'  // blue
    ];
    
    return colors[accountId % colors.length];
  };

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
            Select your profile
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Select profile or create a new one
          </Typography>
        </Box>

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
              Click the "Create New profile" button below to get started
            </Typography>
          </Box>
        ) : null}

        <Grid container spacing={3} justifyContent="center" sx={{ display: 'flex', flex: 1 }} >
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={account.id}>
              <Card 
                sx={{ 
                  height: 230,
                  width: '25vh',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6
                  },
                  bgcolor: 'background.paper',
                  position: 'relative'
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
                      bgcolor: getRandomColor(account.id)
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
                
                <Tooltip title="Edit account">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(account);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'white'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Card>
            </Grid>
          ))}
          {accounts.length < MAX_ACCOUNTS && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: 230,
                  width: '25vh',
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
                      New Profile
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

        {renderDialog()}       
        {renderEditDialog()}
        {renderDeleteConfirmDialog()}
      </Container>
    </Box>
  );
};

export default AccountSelectionPage;
