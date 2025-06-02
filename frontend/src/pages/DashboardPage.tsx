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
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
  Tooltip,
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { Link as RouterLink } from 'react-router-dom';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import api from "../utils/api";
import TransactionsList from "../components/TransactionsList";
import TransactionForm from "../components/TransactionForm";
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

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

interface Transaction {
  id: number;
  amount: string;
  transaction_date: string;
  description: string;
  category_name: string | null;  // Updated to handle null
  account_name: string;
  frequency: string;
}

interface CategorySpending {
  category: string;
  amount: number;
  color: string;
}

interface SpendingStats {
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  biggestExpense: Transaction | null;
  biggestIncome: Transaction | null;
  categoryBreakdown: CategorySpending[];
}

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { logout, user } = useAuth();  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [spendingStats, setSpendingStats] = useState<SpendingStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netChange: 0,
    biggestExpense: null,
    biggestIncome: null,
    categoryBreakdown: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Log current cookies for debugging
  useEffect(() => {
    console.log("Current cookies in DashboardPage:", document.cookie);
  }, []);

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
        // Get access token from cookie - same method as AccountSelectionPage
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        console.log("Found access token in DashboardPage:", accessToken ? "Yes" : "No");

        // Fetch the specific account data with explicit token
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

  // Fetch statistics when account is loaded or refreshTrigger changes
  useEffect(() => {
    const fetchAccountStatistics = async () => {
      if (!selectedAccount) return;
      
      setStatsLoading(true);
      
      try {
        // Get access token from cookie
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];
        
        // Fetch transactions for the selected account
        const response = await api.get(`/api/transactions/by_account/`, {
          params: { account_id: selectedAccount.id },
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });
        
        const transactions = response.data;
        
        // Calculate statistics
        let totalIncome = 0;
        let totalExpenses = 0;
        let biggestExpense = null;
        let biggestIncome = null;
        const categoryAmounts: {[key: string]: number} = {};
        const categoryColors: {[key: string]: string} = {};
        
        // Process transactions
        transactions.forEach((transaction: Transaction) => {
          const amount = parseFloat(transaction.amount);
          
          // Track income vs expenses
          if (amount > 0) {
            totalIncome += amount;
            if (!biggestIncome || amount > parseFloat(biggestIncome.amount)) {
              biggestIncome = transaction;
            }
          } else {
            totalExpenses += Math.abs(amount);
            if (!biggestExpense || Math.abs(amount) > Math.abs(parseFloat(biggestExpense.amount))) {
              biggestExpense = transaction;
            }
          }
          
          // Track category spending - handle null category_name
          const category = transaction.category_name || 'Uncategorized';
          if (!categoryAmounts[category]) {
            categoryAmounts[category] = 0;
            // Assign a color based on the category name (consistent for same categories)
            const colorIndex = Object.keys(categoryAmounts).length % colors.length;
            categoryColors[category] = colors[colorIndex];
          }
          // For category breakdown, we're interested in expenses (negative values)
          if (amount < 0) {
            categoryAmounts[category] += Math.abs(amount);
          }
        });
        
        // Create category breakdown for pie chart
        const categoryBreakdown: CategorySpending[] = Object.keys(categoryAmounts)
          .filter(category => categoryAmounts[category] > 0)
          .map(category => ({
            category,
            amount: categoryAmounts[category],
            color: categoryColors[category]
          }))
          .sort((a, b) => b.amount - a.amount);
        
        // Update spending stats
        setSpendingStats({
          totalIncome,
          totalExpenses,
          netChange: totalIncome - totalExpenses,
          biggestExpense,
          biggestIncome,
          categoryBreakdown
        });
        
      } catch (error) {
        console.error("Error fetching account statistics:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchAccountStatistics();
  }, [selectedAccount, refreshTrigger]);

  const handleSwitchAccount = () => {
    navigate('/accounts');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Color palette for the pie chart
  const colors = [
    '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f',
    '#0288d1', '#689f38', '#f9a825', '#512da8', '#c2185b',
    '#00796b', '#5d4037', '#455a64', '#e64a19', '#1565c0'
  ];

  // Format currency values
  const formatCurrency = (value: number): string => {
    return selectedAccount?.currency?.symbol + value.toFixed(2);
  };

  // Format currency values without symbol for mobile
  const formatCurrencyMobile = (value: number): string => {
    return value.toFixed(2);
  };

  // Format date to readable format
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 2, sm: 4 } }}>
        <Button
          variant="outlined"
          size="large"
          component={RouterLink}
          to="/accounts"
          startIcon={<AccountBalanceIcon />}
          sx={{ mb: { xs: 2, sm: 3 }, width: { xs: '100%', sm: 'auto' } }}
        >
          Switch Account
        </Button>

        {/* First row - Account Overview Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          {/* Account Summary Card */}
          <Grid item xs={12} lg={4} sx={{ display: 'flex', flex: 1 }}>
            <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', borderRadius: 2, border: 1, borderColor: 'divider', width: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <AccountBalanceIcon sx={{ fontSize: { xs: 20, sm: 24 }, mr: 2, color: 'primary.main' }} />
                <Box textAlign="center">
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{selectedAccount.name}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">Current Balance</Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {selectedAccount.currency?.symbol}
                  </Box>
                  {selectedAccount.balance}
                </Typography>
              </Box>

              {/* Financial Summary */}
              <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
                <Grid item xs={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      textAlign: 'center', 
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      borderRadius: 2
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Income</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {statsLoading ? '...' : formatCurrency(spendingStats.totalIncome)}
                      </Box>
                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        {statsLoading ? '...' : formatCurrencyMobile(spendingStats.totalIncome)}
                      </Box>
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      textAlign: 'center', 
                      bgcolor: 'error.light',
                      color: 'error.contrastText',
                      borderRadius: 2
                    }}
                  >
                    <TrendingDownIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Expenses</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {statsLoading ? '...' : formatCurrency(spendingStats.totalExpenses)}
                      </Box>
                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        {statsLoading ? '...' : formatCurrencyMobile(spendingStats.totalExpenses)}
                      </Box>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Account actions */}
              <Box mt="auto">
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  component={RouterLink}
                  to={`/accounts/edit/${selectedAccount.id}`}
                >
                  Manage Account
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Category Spending Breakdown */}
          <Grid item xs={12} lg={4} sx={{ display: 'flex', flex: 1 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                height: '100%',
                borderRadius: 2, 
                border: 1, 
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <CategoryIcon sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Spending by Category</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {statsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress size={{ xs: 30, sm: 40 }} />
                  </Box>
                ) : spendingStats.categoryBreakdown.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>No expense data available</Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ height: { xs: 140, sm: 180 }, mt: 1, mb: 2 }}>
                      <PieChart
                        series={[
                          {
                            data: spendingStats.categoryBreakdown.map(item => ({
                              id: item.category,
                              value: item.amount,
                              color: item.color
                            })),
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' }
                          }
                        ]}
                        height={window.innerWidth < 600 ? 140 : 180}
                        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                        slotProps={{
                          legend: { hidden: true }
                        }}
                      />
                    </Box>

                    {/* Top Categories List - simplified for horizontal layout */}
                    {spendingStats.categoryBreakdown.length > 0 && (
                      <Box mt={1} textAlign="center">
                        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          Top category: {spendingStats.categoryBreakdown[0].category}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            {formatCurrency(spendingStats.categoryBreakdown[0].amount)}
                          </Box>
                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                            {formatCurrencyMobile(spendingStats.categoryBreakdown[0].amount)}
                          </Box>
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Biggest Expense Card */}
          <Grid item xs={12} lg={4} sx={{ display: 'flex', flex: 1 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 1.5, sm: 2 },
                height: '100%',
                borderRadius: 2, 
                border: 1, 
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <ReceiptLongIcon sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1, color: 'error.main' }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Biggest Expense</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                {statsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress size={{ xs: 25, sm: 30 }} />
                  </Box>
                ) : !spendingStats.biggestExpense ? (
                  <Box textAlign="center">
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>No expenses recorded</Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h3" color="error" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.75rem', sm: '3rem' } }}>
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {formatCurrency(Math.abs(parseFloat(spendingStats.biggestExpense.amount)))}
                      </Box>
                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        {formatCurrencyMobile(Math.abs(parseFloat(spendingStats.biggestExpense.amount)))}
                      </Box>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {spendingStats.biggestExpense.description || spendingStats.biggestExpense.category_name || 'No description'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {formatDate(spendingStats.biggestExpense.transaction_date)}
                    </Typography>
                    {spendingStats.biggestExpense.category_name && (
                      <Typography variant="caption" component="div" sx={{ mt: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        Category: {spendingStats.biggestExpense.category_name}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Second row - Transaction Form and List */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ justifyContent: 'center' }}>
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Transactions
              </Typography>

              <Box mb={{ xs: 2, sm: 3 }}>
                <TransactionForm 
                  accountId={selectedAccount.id} 
                  onTransactionAdded={() => setRefreshTrigger(prev => prev + 1)}
                />
              </Box>
              <Box flexGrow={1}>
                <TransactionsList 
                  accountId={selectedAccount.id} 
                  refreshTrigger={refreshTrigger}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
