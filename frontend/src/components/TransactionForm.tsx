import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  InputAdornment,
  Paper,
  Alert,
  Collapse,
  IconButton,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import api from '../utils/api';

interface Category {
  id: number;
  name: string;
}

interface TransactionFormProps {
  accountId: number;
  onTransactionAdded: () => void;
}

const TransactionForm = ({ accountId, onTransactionAdded }: TransactionFormProps) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery('(max-width:700px)');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    transaction_date: new Date(),
    description: '',
    frequency: 'none',
    next_due_date: null as Date | null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get access token from cookie
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];
        
        const response = await api.get('/api/categories/', {
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          }
        });
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Some form features may be limited.');
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({ ...formData, transaction_date: date });
    }
  };

  const handleNextDueDateChange = (date: Date | null) => {
    setFormData({ ...formData, next_due_date: date });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setSuccess(false);
    setError('');

    // Prepare data for API
    const payload = {
      account: accountId,
      category: parseInt(formData.category_id),
      amount: parseFloat(formData.amount),
      transaction_date: formData.transaction_date.toISOString(),
      description: formData.description,
      frequency: formData.frequency,
      next_due_date: formData.next_due_date ? formData.next_due_date.toISOString().split('T')[0] : null,
    };

    try {
      // Get access token from cookie
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
      await api.post('/api/transactions/', payload, {
        headers: {
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        }
      });
      
      // Reset form
      setFormData({
        amount: '',
        category_id: '',
        transaction_date: new Date(),
        description: '',
        frequency: 'none',
        next_due_date: null,
      });
      
      setSuccess(true);
      onTransactionAdded();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to add transaction:', err);
      setError(err.response?.data?.detail || 'Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Add New Transaction
      </Typography>

      <Collapse in={success}>
        <Alert
          severity="success"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccess(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Transaction added successfully!
        </Alert>
      </Collapse>

      <Collapse in={!!error}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError('')}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      </Collapse>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: { xs: '100%', sm: 'auto' } }}>
        <Grid container spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Grid item xs={12} md={isSmallScreen ? 12 : 4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              fullWidth
              required
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              helperText="Use negative values for expenses, positive for income"
              InputProps={{
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />
          </Grid>

          <Grid item xs={12} md={isSmallScreen ? 12 : 4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <FormControl fullWidth required sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category_id"
                value={formData.category_id}
                onChange={handleSelectChange}
                label="Category"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select transaction category</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={isSmallScreen ? 12 : 4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Transaction Date"
                value={formData.transaction_date}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    sx: { width: { xs: '100%', sm: 'auto' } }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={isSmallScreen ? 12 : 4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <FormControl fullWidth sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleSelectChange}
                label="Frequency"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <MenuItem value="none">One-time</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
              <FormHelperText>For recurring transactions</FormHelperText>
            </FormControl>
          </Grid>

          {formData.frequency !== 'none' && (
            <Grid item xs={12} md={isSmallScreen ? 12 : 4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Next Due Date"
                  value={formData.next_due_date}
                  onChange={handleNextDueDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: { width: { xs: '100%', sm: 'auto' } }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          )}

          <Grid item xs={12} md={isSmallScreen ? 12 : 4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              sx={{ height: '56px', width: { xs: '100%', sm: 'auto' } }}
            />
          </Grid>

          <Grid item xs={12} md={isSmallScreen ? 12 : 4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ height: '56px', width: { xs: '100%', sm: 'auto' } }}
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TransactionForm;
