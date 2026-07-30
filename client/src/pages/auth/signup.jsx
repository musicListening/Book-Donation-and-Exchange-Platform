import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email domain
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'yahoomail.com'];
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      setError('Only Gmail, Outlook, and Yahoo mail are allowed for registration.');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Register with END_USER role
      const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api');
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          role: 'END_USER' 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      alert('Registration successful! Please log in.');
      navigate('/login');
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
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px', 
      margin: 0 
    },
    signupContainer: { 
      width: '100%', 
      maxWidth: 500, 
      background: 'white', 
      padding: 40, 
      borderRadius: 16, 
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)' 
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
      fontSize: 16, 
      fontWeight: 700, 
      cursor: 'pointer', 
      backgroundColor: '#1E4D4B', 
      color: 'white',
      marginTop: 10,
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
      fontWeight: '500',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.signupContainer}>
        <Link to="/" style={styles.logo}>
          <i className="fa-solid fa-book-open"></i> ShareShelf
        </Link>
        <p style={{ textAlign: 'center', color: '#6C757D', marginBottom: 30 }}>
          Join the reading revolution!
        </p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text" 
              style={styles.formControl} 
              required 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              style={styles.formControl} 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ display: 'flex', alignItems: 'stretch', border: '2px solid #DEE2E6', borderRadius: 12, overflow: 'hidden', backgroundColor: '#EBF1FD' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                style={{ flex: 1, padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 15, border: 'none', borderRadius: 0, background: 'transparent', outline: 'none', boxSizing: 'border-box' }} 
                required 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a secure password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: '#DDE2E8', border: 'none', borderLeft: '2px solid #DEE2E6', cursor: 'pointer', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#343A40' }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={{ display: 'flex', alignItems: 'stretch', border: '2px solid #DEE2E6', borderRadius: 12, overflow: 'hidden', backgroundColor: '#EBF1FD' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                style={{ flex: 1, padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 15, border: 'none', borderRadius: 0, background: 'transparent', outline: 'none', boxSizing: 'border-box' }} 
                required 
                value={formData.confirmPassword} 
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ background: '#DDE2E8', border: 'none', borderLeft: '2px solid #DEE2E6', cursor: 'pointer', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#343A40' }}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.btn,
              ...(loading ? styles.btnDisabled : {})
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 25, fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#E76F51', textDecoration: 'none', fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;