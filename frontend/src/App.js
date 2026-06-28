import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');

  const API_URL = 'https://bayramovh062.pythonanywhere.com/api';

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!isLoginView && password !== confirmPassword) {
      toast.error("Passwords do not match! Please try again.");
      return;
    }

    const endpoint = isLoginView ? '/login' : '/register';

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, { username, password });

      if (isLoginView) {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        toast.success("Logged in successfully!");
      } else {
        toast.success("Registration successful! You can now log in.");
        setIsLoginView(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred!");
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setExpenses([]);
    toast.info("Logged out.");
  };

  const fetchExpenses = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data);
    } catch (error) {
      if (error.response?.status === 401) logout();
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const addEntry = async (e) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.warn("Please fill in all fields!");
      return;
    }
    try {
      await axios.post(`${API_URL}/expenses`,
        { title, amount: parseFloat(amount), type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setAmount('');
      fetchExpenses();
      toast.success("Entry added!");
    } catch (error) {
      if (error.response?.status === 401) logout();
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
      toast.success("Entry deleted!");
    } catch (error) {
      if (error.response?.status === 401) logout();
    }
  };

  // ==========================================
  // HESABLAMALAR VƏ QRAFİK DATASI
  // ==========================================

  const balance = expenses.reduce((acc, curr) =>
    curr.type.toLowerCase() === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0);

  const totalIncome = expenses
    .filter(item => item.type.toLowerCase() === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = expenses
    .filter(item => item.type.toLowerCase() === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Chart.js DATASI
  const chartData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [totalIncome || 0, totalExpense || 0],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#20c997', '#c82333'],
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.toFixed(2)}`
        }
      }
    }
  };

  // ==========================================
  // UI RENDER
  // ==========================================

  if (!token) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <div className="App auth-container">
          <div className="auth-card">
            <h2>{isLoginView ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleAuth}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {!isLoginView && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}

              <button type="submit" className="auth-btn">
                {isLoginView ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
            <p className="toggle-text" onClick={() => {
              setIsLoginView(!isLoginView);
              setConfirmPassword('');
            }}>
              {isLoginView ? "Don't have an account? Register." : "Already have an account? Login."}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="App">
        <div className="header-top">
          <h2>Expense Tracker</h2>
          <button onClick={logout} className="logout-btn">Logout 🚪</button>
        </div>

        {/* BALANS */}
        <div className="balance-card">
          <p>Total Balance</p>
          <h2 style={{ color: balance >= 0 ? '#2ecc71' : '#e74c3c' }}>
            ${balance.toFixed(2)}
          </h2>

          <div className="gamification-badge">
            {balance >= 0 ? (
              <span className="badge-success">Budget Master 🏆</span>
            ) : (
              <span className="badge-danger">Danger! ⚠️</span>
            )}
          </div>
        </div>

        <form onSubmit={addEntry}>
          <input placeholder="Description" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense (-)</option>
            <option value="income">Income (+)</option>
          </select>
          <button type="submit" className="add-btn">Add</button>
        </form>

        {/* QRAFİK - CHART.JS */}
        {(totalIncome > 0 || totalExpense > 0) && (
          <div className="chart-container">
            <h4>Financial Analysis</h4>
            <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="list-header">
            <h3>History</h3>
          </div>
        )}

        <ul className="list">
          {expenses.map(exp => (
            <li key={exp.id} className={`item ${exp.type}`}>
              <div className="item-info">
                <span className="item-title">{exp.title}</span>
                <span className="item-date">{new Date(exp.date).toLocaleDateString('en-US')}</span>
              </div>
              <div className="item-right">
                <span className="item-amount">
                  {exp.type.toLowerCase() === 'income' ? '+' : '-'}${exp.amount}
                </span>
                <button onClick={() => deleteItem(exp.id)} className="delete-btn">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;