import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button } from "@mui/material";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [newExpense, setNewExpense] = useState({
    amount: 0,
    description: "",
    category: "",
    transaction_date: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get("http://localhost:8000/api/expenses/list_expenses/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data);
    } catch (err) {
      setError("Failed to fetch expenses. Try again later.");
    }
    setLoading(false);
  };

  const fetchTotalExpenses = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !startDate || !endDate) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/expenses/total_expenses/?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTotalExpenses(response.data.total_expenses);
    } catch (err) {
      console.error("Failed to fetch total expenses");
    }
  };

  const handleAddExpense = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Unauthorized. Please log in.");
      return;
    }

    const formattedExpense = {
      ...newExpense,
      account_name: "User's Checking Account",
      transaction_date: `${newExpense.transaction_date}T10:00:00`,
    };

    try {
      await axios.post("http://localhost:8000/api/expenses/add_expense/", formattedExpense, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExpenses();
      setNewExpense({ amount: 0, description: "", category: "", transaction_date: "" });
    } catch (err) {
      setError("Failed to add expense. Try again later.");
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Unauthorized. Please log in.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/expenses/${expenseId}/delete_expense/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExpenses();
    } catch (err) {
      setError("Failed to delete expense. Try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Expenses
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No expenses recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.transaction_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${expense.amount}</TableCell>
                      <TableCell>{expense.description || "No description"}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ mt: 4 }}>
            Add Expense
          </Typography>
          <TextField
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newExpense.transaction_date}
            onChange={(e) => setNewExpense({ ...newExpense, transaction_date: e.target.value })}
            sx={{ mt: 2, width: "100%" }}
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Category"
            fullWidth
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleAddExpense}>
            Add Expense
          </Button>

          <Typography variant="h5" sx={{ mt: 4 }}>
            Get Sum
          </Typography>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={fetchTotalExpenses}>
              Get Total
            </Button>
          </div>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total Expenses: ${totalExpenses.toFixed(2)}
          </Typography>

          <Button variant="contained" color="error" sx={{ mt: 4 }} onClick={handleLogout}>
            Logout
          </Button>
        </>
      )}
    </Container>
  );
};

export default ExpensesPage;
