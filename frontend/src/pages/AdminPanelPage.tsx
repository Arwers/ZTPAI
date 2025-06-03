import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Collapse,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { Link as RouterLink } from 'react-router-dom';
import api from "../utils/api";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

interface UserAccount {
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
  user: {
    id: number;
    username: string;
  };
}

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'users' | 'accounts'>('users');
  
  // Dialog states
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_staff) {
      navigate('/accounts');
    }
  }, [user, navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.is_staff) return;
      
      setIsLoading(true);
      try {
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        const headers = {
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        };

        const [usersResponse, accountsResponse] = await Promise.all([
          api.get('/api/accounts/admin/users/', { headers }),
          api.get('/api/accounts/admin/accounts/', { headers })
        ]);

        setUsers(usersResponse.data || []);
        setAccounts(accountsResponse.data || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      const response = await api.post('/api/accounts/admin/users/', newUser, {
        headers: {
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          'Content-Type': 'application/json'
        }
      });

      setUsers(prev => [...prev, response.data]);
      setCreateUserDialog(false);
      setNewUser({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        is_staff: false,
      });
      setSuccess('User created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      await api.delete(`/api/accounts/admin/users/${selectedUser.id}/`, {
        headers: {
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        }
      });

      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setAccounts(prev => prev.filter(a => a.user.id !== selectedUser.id));
      setDeleteUserDialog(false);
      setSelectedUser(null);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    setIsSubmitting(true);
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      await api.delete(`/api/accounts/admin/accounts/${selectedAccount.id}/`, {
        headers: {
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        }
      });

      setAccounts(prev => prev.filter(a => a.id !== selectedAccount.id));
      setDeleteAccountDialog(false);
      setSelectedAccount(null);
      setSuccess('Account deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to delete account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
      bgcolor: 'background.default',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1} 
        sx={{ 
          bgcolor: 'background.paper',
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
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
              transition: 'color 0.3s ease',
            }}
          >
            <FontAwesomeIcon 
              icon={faChartPie} 
              style={{ fontSize: '1.5rem', marginRight: '10px' }} 
            />
            <Typography variant="h6" component="div" color="text.primary" sx={{ transition: 'color 0.3s ease' }}>
              Finance Tracker
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant={selectedTab === 'users' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('users')}
              sx={{ 
                mr: 2, 
                transition: 'all 0.3s ease',
                display: { xs: 'none', md: 'flex' }
              }}
              startIcon={<PersonIcon />}
            >
              Manage Users
            </Button>
            <Button
              variant={selectedTab === 'accounts' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('accounts')}
              sx={{ 
                transition: 'all 0.3s ease',
                display: { xs: 'none', md: 'flex' }
              }}
              startIcon={<AdminPanelSettingsIcon />}
            >
              Manage Accounts
            </Button>
            <ThemeToggle />
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              sx={{ transition: 'all 0.3s ease' }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>      
      
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 2, sm: 4 } }}>
        {/* Alerts */}
        <Collapse in={!!success}>
          <Alert severity="success" sx={{ mb: 2, transition: 'all 0.3s ease' }}>
            {success}
          </Alert>
        </Collapse>

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 2, transition: 'all 0.3s ease' }}>
            {error}
          </Alert>
        </Collapse>

        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <AdminPanelSettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Admin Panel
          </Typography>
        </Box>

        {/* Tab Buttons - Mobile Only */}
        <Box mb={3} sx={{ display: { xs: 'block', md: 'none' } }}>
          <Button
            variant={selectedTab === 'users' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('users')}
            sx={{ 
              mb: 1, 
              transition: 'all 0.3s ease',
              width: '100%'
            }}
            startIcon={<PersonIcon />}
          >
            Manage Users
          </Button>
          <Button
            variant={selectedTab === 'accounts' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('accounts')}
            sx={{ 
              transition: 'all 0.3s ease',
              width: '100%'
            }}
            startIcon={<AdminPanelSettingsIcon />}
          >
            Manage Accounts
          </Button>
        </Box>

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: 1, 
              borderColor: 'divider',
              transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Users Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateUserDialog(true)}
                sx={{ transition: 'all 0.3s ease' }}
              >
                Create User
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userRow) => (
                    <TableRow key={userRow.id}>
                      <TableCell>{userRow.username}</TableCell>
                      <TableCell>{userRow.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={userRow.is_staff ? 'Admin' : 'User'} 
                          color={userRow.is_staff ? 'primary' : 'default'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={userRow.is_active ? 'Active' : 'Inactive'} 
                          color={userRow.is_active ? 'success' : 'error'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedUser(userRow);
                            setDeleteUserDialog(true);
                          }}
                          disabled={userRow.id === user?.id} // Prevent self-deletion
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Accounts Tab */}
        {selectedTab === 'accounts' && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: 1, 
              borderColor: 'divider',
              transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
          >
            <Typography variant="h5" mb={3}>Accounts Management</Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Currency</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.user.username}</TableCell>
                      <TableCell>{account.account_type.name}</TableCell>
                      <TableCell>{account.balance}</TableCell>
                      <TableCell>{account.currency.code}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedAccount(account);
                            setDeleteAccountDialog(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Create User Dialog */}
        <Dialog open={createUserDialog} onClose={() => setCreateUserDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="First Name"
              margin="normal"
              value={newUser.first_name}
              onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              value={newUser.last_name}
              onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <TextField
              fullWidth
              select
              label="Role"
              margin="normal"
              value={newUser.is_staff}
              onChange={(e) => setNewUser({ ...newUser, is_staff: e.target.value === 'true' })}
            >
              <MenuItem value="false">User</MenuItem>
              <MenuItem value="true">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateUserDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={deleteUserDialog} onClose={() => setDeleteUserDialog(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user "{selectedUser?.username}"?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              This action cannot be undone. All accounts and transactions for this user will also be deleted.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteUserDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteUser} color="error" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={deleteAccountDialog} onClose={() => setDeleteAccountDialog(false)}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete account "{selectedAccount?.name}" owned by "{selectedAccount?.user.username}"?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              This action cannot be undone. All transactions for this account will also be deleted.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteAccountDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminPanelPage;
