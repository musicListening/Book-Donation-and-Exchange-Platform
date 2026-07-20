import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
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
    setMode(initialMode);
  }, [initialMode]);

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

  if (!isOpen && !loading) return null; // Don't unmount immediately to allow CSS transition, but here we can just use CSS opacity since we render it always or conditionally. Actually, better to always render it in DOM if isOpen, or use a delayed unmount. Let's just always render and use CSS for visibility.

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('ss_current_user', JSON.stringify(data.user));
      
      const userRole = data.user.role;
      
      onClose(); // Close modal on success

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
      alert('Registration successful! Please log in.');
    } catch (err) {
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
