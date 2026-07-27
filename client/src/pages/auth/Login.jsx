import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api');
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const previousUser = JSON.parse(localStorage.getItem('ss_current_user') || 'null');
      if (previousUser && previousUser.id !== data.user.id) {
        localStorage.removeItem('ss_cart');
        localStorage.removeItem('ss_orders');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('ss_current_user', JSON.stringify(data.user));
      
      const userRole = data.user.role;
      
      // If there's a redirect path and it's valid, use it
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }

      // Otherwise, redirect based on role
      if (userRole === 'PLATFORM_ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'OPERATIONS_STAFF') {
        navigate('/staff/dashboard');
      } else if (userRole === 'DELIVERY_PERSONNEL') {
        navigate('/delivery/DeliveryPersonPage');
      } else if (userRole === 'COMMUNITY_ADMIN') {
        navigate('/community-admin/dashboard');
      } else {
        navigate('/user-dashboard');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    body: { 
      fontFamily: 'Inter, sans-serif', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      margin: 0 
    },
    loginContainer: { 
      width: '100%', 
      maxWidth: 450, 
      background: 'white', 
      padding: 40, 
      borderRadius: 16, 
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', 
      textAlign: 'center' 
    },
    logo: { 
      fontFamily: 'Playfair Display, serif', 
      fontSize: 32, 
      fontWeight: 800, 
      color: '#1E4D4B', 
      textDecoration: 'none', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 10, 
      marginBottom: 10 
    },
    formGroup: { 
      textAlign: 'left', 
      marginBottom: 20 
    },
    label: { 
      display: 'block', 
      fontSize: 14, 
      fontWeight: 600, 
      marginBottom: 8, 
      color: '#343A40' 
    },
    formControl: { 
      width: '100%', 
      padding: '12px 16px', 
      border: '2px solid #DEE2E6', 
      borderRadius: 12, 
      fontFamily: 'Inter, sans-serif', 
      fontSize: 15,
      boxSizing: 'border-box'
    },
    btn: { 
      width: '100%', 
      padding: 14, 
      border: 'none', 
      borderRadius: 12, 
      fontFamily: 'Inter, sans-serif', 
      fontSize: 16, 
      fontWeight: 700, 
      cursor: 'pointer', 
      backgroundColor: '#1E4D4B', 
      color: 'white',
      transition: 'all 0.3s ease'
    },
    btnDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed'
    },
    error: {
      backgroundColor: '#fff3f3',
      color: '#dc3545',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },
    demoHint: { 
      marginTop: 30, 
      padding: 15, 
      background: 'rgba(233,196,106,0.1)', 
      borderRadius: 12, 
      fontSize: 12, 
      color: '#7A5C10' 
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.loginContainer}>
        <Link to="/" style={styles.logo}>
          <i className="fa-solid fa-book-open"></i> ShareShelf
        </Link>
        <p style={{ color: '#6C757D', marginBottom: 30 }}>
          {redirectPath ? 'Please log in to continue' : 'Welcome back, book lover!'}
        </p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              style={styles.formControl} 
              placeholder="name@example.com" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              style={styles.formControl} 
              placeholder="••••••••" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.btn,
              ...(loading ? styles.btnDisabled : {})
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <p style={{ marginTop: 25, fontSize: 14 }}>
          Don't have an account? <Link to="/signup" style={{ color: '#E76F51', textDecoration: 'none', fontWeight: 700 }}>Join the revolution</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;