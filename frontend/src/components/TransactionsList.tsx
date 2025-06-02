import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CategoryIcon from '@mui/icons-material/Category';
import api from '../utils/api';

interface Transaction {
  id: number;
  amount: string;
  transaction_date: string;
  description: string;
  category_name: string;
  account_name: string;
  frequency: string;
}

interface TransactionsListProps {
  accountId: number;
  refreshTrigger: number;
  onTransactionDeleted?: () => void;
}

const TransactionsList = ({ accountId, refreshTrigger, onTransactionDeleted }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Get access token from cookie
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];
        
        const response = await api.get(`/api/transactions/by_account/`, {
          params: { account_id: accountId },
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });
        setTransactions(response.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId, refreshTrigger]);

  const handleDelete = async (transactionId: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        await api.delete(`/api/transactions/${transactionId}/`, {
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });

        // Refresh the transactions list
        setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
        
        // Trigger dashboard refresh if callback provided
        if (onTransactionDeleted) {
          onTransactionDeleted();
        }
      } catch (err) {
        console.error('Failed to delete transaction:', err);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box p={2} textAlign="center">
        <Typography>No transactions found for this account.</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        maxHeight: '60vh',
        overflow: 'auto',
        backgroundColor: 'background.paper',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,.05)',
        },
      }}
    >
      <List disablePadding>
        {transactions.map((transaction, index) => {
          const isPositive = parseFloat(transaction.amount) > 0;
          
          return (
            <Box key={transaction.id}>
              {index > 0 && <Divider variant="inset" component="li" />}
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Tooltip title="Delete transaction">
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: isPositive ? 'success.main' : 'error.main',
                    }}
                  >
                    {isPositive ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography component="span" variant="body1">
                        {transaction.description || transaction.category_name}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body1"
                        sx={{
                          color: isPositive ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {isPositive ? '+' : ''}{transaction.amount}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {formatDate(transaction.transaction_date)}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <CategoryIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                        <Typography variant="body2" color="text.secondary">
                          {transaction.category_name}
                        </Typography>
                        {transaction.frequency !== 'none' && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 1,
                              backgroundColor: 'primary.main',
                              color: 'white',
                              px: 0.5,
                              py: 0.2,
                              borderRadius: 0.5,
                            }}
                          >
                            {transaction.frequency.toUpperCase()}
                          </Typography>
                        )}
                      </Box>
                    </>
                  }
                />
              </ListItem>
            </Box>
          );
        })}
      </List>
    </Paper>
  );
};

export default TransactionsList;
