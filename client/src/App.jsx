import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; 
import './index.css';

const API_URL = 'http://localhost:3001';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Idempotency Key
  const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
  
  // Filter/Sort State
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_desc'); 

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (sortBy === 'date_desc') params.append('sort', 'date_desc');
      
      const response = await fetch(`${API_URL}/expenses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError('Could not load expenses. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, sortBy]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        amount: parseFloat(amount),
        category,
        description,
        date,
        idempotencyKey
      };

      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create expense');
      }

      fetchExpenses();
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIdempotencyKey(uuidv4());
      
    } catch (err) {
      setError('Failed to save expense. You can try clicking "Add Expense" again safely.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="container">
      <h1>Expense Tracker</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Lunch, Taxi, etc."
              />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Expense'}
          </button>
          
          {error && <div className="error">{error}</div>}
        </form>
      </div>

      <div className="controls">
        <div className="form-group" style={{maxWidth: '200px'}}>
            <label>Filter by Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <div className="form-group" style={{maxWidth: '200px'}}>
             <label>Sort By</label>
             <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                 <option value="created_desc">Added Recently</option>
                 <option value="date_desc">Date (Newest First)</option>
             </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
            <div className="loading">Loading expenses...</div>
        ) : (
            <>
                <ul className="expense-list">
                    {expenses.length === 0 && <li className="expense-item" style={{justifyContent: 'center'}}>No expenses found.</li>}
                    {expenses.map((expense) => (
                        <li key={expense.id} className="expense-item">
                            <div className="expense-info">
                                <span className="expense-category">{expense.category}</span>
                                <span className="expense-desc">{expense.description || 'No description'}</span>
                                <span className="expense-date">{expense.date}</span>
                            </div>
                            <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="total-display">
                    Total: ₹{totalAmount.toFixed(2)}
                </div>
            </>
        )}
      </div>
    </div>
  );
}

export default App;
