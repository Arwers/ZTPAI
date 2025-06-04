import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { Link as RouterLink } from 'react-router-dom';
import { PieChart } from '@mui/x-charts/PieChart';
import api from "../utils/api";
import TransactionsList from "../components/TransactionsList";
import TransactionForm from "../components/TransactionForm";
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

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
  currentBalance: number;
  spendingLimit: number;
  remainingBudget: number;
  biggestExpense: Transaction | null;
  biggestIncome: Transaction | null;
  categoryBreakdown: CategorySpending[];
}

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [spendingStats, setSpendingStats] = useState<SpendingStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netChange: 0,
    currentBalance: 0,
    spendingLimit: 0,
    remainingBudget: 0,
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
      const urlAccountId = searchParams.get('acc');
      const storageAccountId = localStorage.getItem('selectedAccountId');
      const accountId = urlAccountId || storageAccountId;

      if (!accountId) {
        navigate('/accounts');
        return;
      }

      try {
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        const response = await api.get(`/api/accounts/${accountId}/`, {
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });

        setSelectedAccount(response.data);
        
        if (urlAccountId) {
          localStorage.setItem('selectedAccountId', urlAccountId);
        }
        
        if (!urlAccountId && storageAccountId) {
          navigate(`/dashboard?acc=${storageAccountId}`, { replace: true });
        }

      } catch (error) {
        console.error("Error fetching account:", error);
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

  useEffect(() => {
    const fetchAccountStatistics = async () => {
      if (!selectedAccount) return;
      
      setStatsLoading(true);
      
      try {
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];
        
        const response = await api.get(`/api/transactions/by_account/`, {
          params: { account_id: selectedAccount.id },
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });
        
        const transactions = response.data;
        
        let totalIncome = 0;
        let totalExpenses = 0;
        let biggestExpense = null;
        let biggestIncome = null;
        const categoryAmounts: {[key: string]: number} = {};
        const categoryColors: {[key: string]: string} = {};
        
        transactions.forEach((transaction: Transaction) => {
          const amount = parseFloat(transaction.amount);
          
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
          
          const category = transaction.category_name || 'Uncategorized';
          if (!categoryAmounts[category]) {
            categoryAmounts[category] = 0;
            const colorIndex = Object.keys(categoryAmounts).length % colors.length;
            categoryColors[category] = colors[colorIndex];
          }
          if (amount < 0) {
            categoryAmounts[category] += Math.abs(amount);
          }
        });
        
        const categoryBreakdown: CategorySpending[] = Object.keys(categoryAmounts)
          .filter(category => categoryAmounts[category] > 0)
          .map(category => ({
            category,
            amount: categoryAmounts[category],
            color: categoryColors[category]
          }))
          .sort((a, b) => b.amount - a.amount);
        
        const currentBalance = totalIncome - totalExpenses;
        const spendingLimit = parseFloat(selectedAccount.balance);
        const remainingBudget = spendingLimit - totalExpenses;
        
        setSpendingStats({
          totalIncome,
          totalExpenses,
          netChange: totalIncome - totalExpenses,
          currentBalance,
          spendingLimit,
          remainingBudget,
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

  const formatCurrency = (value: number): string => {
    return value.toFixed(2) + selectedAccount?.currency?.symbol;
  };

  const formatCurrencyMobile = (value: number): string => {
    return value.toFixed(2);
  };

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
    return null;
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
            {user?.is_staff && (
              <Button 
                variant="outlined" 
                component={RouterLink}
                to="/admin-panel"
                sx={{ 
                  display: { xs: 'none', lg: 'block' },
                  transition: 'all 0.3s ease',
                }}
              >
                Admin Panel
              </Button>
            )}
            <Button 
              variant="outlined" 
              onClick={handleSwitchAccount}
              sx={{ 
                display: { xs: 'none', md: 'block' },
                transition: 'all 0.3s ease',
              }}
            >
              Switch Account
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
        <Button
          variant="outlined"
          size="large"
          component={RouterLink}
          to="/accounts"
          startIcon={<AccountBalanceIcon />}
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            width: { xs: '100%', sm: 'auto' }, 
            display: { xs: 'flex', md: 'none' },
            transition: 'all 0.3s ease',
          }}
        >
          Switch Account
        </Button>

        {user?.is_staff && (
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/admin-panel"
            startIcon={<AdminPanelSettingsIcon />}
            sx={{ 
              mb: { xs: 2, sm: 3 }, 
              width: { xs: '100%', sm: 'auto' }, 
              display: { xs: 'flex', lg: 'none' },
              transition: 'all 0.3s ease',
            }}
          >
            Admin Panel
          </Button>
        )}

        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={12} lg={4} sx={{ display: 'flex', flex: 1 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                height: '100%', 
                borderRadius: 2, 
                border: 1, 
                borderColor: 'divider', 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              }}
            >
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
                  {statsLoading ? '...' : spendingStats.currentBalance.toFixed(2)}
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {selectedAccount.currency?.symbol}
                  </Box>
                </Typography>
              </Box>

              <Box mb={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">Spending Limit</Typography>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {selectedAccount.balance}
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {selectedAccount.currency?.symbol}
                  </Box>
                </Typography>
                <Typography 
                  variant="body2" 
                  color={spendingStats.remainingBudget < 0 ? 'error' : 'success.main'}
                  sx={{ mt: 1 }}
                >
                  {spendingStats.remainingBudget < 0 ? 'Over budget by: ' : 'Remaining budget: '}
                  {Math.abs(spendingStats.remainingBudget).toFixed(2)}
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {selectedAccount.currency?.symbol}
                  </Box>
                </Typography>
              </Box>

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
                width: '100%',
                transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
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
                width: '100%',
                transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
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
                transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
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
                  onTransactionDeleted={() => setRefreshTrigger(prev => prev + 1)}
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
