import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login', 
  redirectTo = null,
  onLoginSuccess = null 
}) {
  const [mode, setMode] = useState(initialMode);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) {
      // Reset forms on close after animation
      setTimeout(() => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setLoading(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login...');
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

      console.log('Login successful!', data);

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('ss_current_user', JSON.stringify(data.user));
      
      const userRole = data.user.role;
      
      // Close modal first
      onClose();

      // If onLoginSuccess callback is provided, use it
      if (onLoginSuccess) {
        console.log('Calling onLoginSuccess with redirectTo:', redirectTo);
        onLoginSuccess(data.token);
        return;
      }

      // If a redirect target was provided, go there
      if (redirectTo) {
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo);
        return;
      }

      // Default navigation based on role
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
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: '#e0e0e0', width: '0%' };
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 1) return { score, label: 'Weak', color: '#E63946', width: '25%' };
    if (score === 2) return { score, label: 'Fair', color: '#F4A261', width: '50%' };
    if (score === 3) return { score, label: 'Good', color: '#2A9D8F', width: '75%' };
    return { score, label: 'Strong', color: '#1E4D4B', width: '100%' };
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email domain
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'yahoomail.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      setError('Only Gmail, Outlook, and Yahoo mail are allowed for registration.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const strength = calculatePasswordStrength(password);
    if (strength.score < 3) {
      setError('Password must be Good or Strong');
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api');
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: 'END_USER' 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Automatically switch to login on success
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setError('');
      alert('Registration successful! Please log in.');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Close when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('auth-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className={`auth-modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleBackdropClick}>
      <div className="auth-modal-card">
        <button className="auth-modal-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="auth-modal-logo">
          <i className="fa-solid fa-book-open"></i> ShareShelf
        </div>

        <h2 className="auth-modal-title">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {error && <div className="auth-modal-error">{error}</div>}

        {mode === 'login' ? (
          <form className="auth-modal-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="auth-modal-btn primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="auth-modal-footer">
              Don't have an account? <button type="button" onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button>
            </div>
          </form>
        ) : (
          <form className="auth-modal-form" onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {password && (
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#6C757D' }}>Password Strength:</span>
                    <span style={{ color: calculatePasswordStrength(password).color, fontWeight: 'bold' }}>{calculatePasswordStrength(password).label}</span>
                  </div>
                  <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: calculatePasswordStrength(password).width, background: calculatePasswordStrength(password).color, transition: 'all 0.3s ease' }}></div>
                  </div>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-container">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="auth-modal-btn primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <div className="auth-modal-footer">
              Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Log In</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}