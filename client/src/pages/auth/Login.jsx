import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('ss_current_user', JSON.stringify(user));
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'staff') navigate('/staff-dashboard');
      else navigate('/user-dashboard');
    } else {
      alert('Invalid email or password');
    }
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 },
    loginContainer: { width: '100%', maxWidth: 450, background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', textAlign: 'center' },
    logo: { fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 800, color: '#1E4D4B', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 },
    formGroup: { textAlign: 'left', marginBottom: 20 },
    label: { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#343A40' },
    formControl: { width: '100%', padding: '12px 16px', border: '2px solid #DEE2E6', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15 },
    btn: { width: '100%', padding: 14, border: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, cursor: 'pointer', backgroundColor: '#1E4D4B', color: 'white' },
    demoHint: { marginTop: 30, padding: 15, background: 'rgba(233,196,106,0.1)', borderRadius: 12, fontSize: 12, color: '#7A5C10' }
  };

  return (
    <div style={styles.body}>
      <div style={styles.loginContainer}>
        <Link to="/" style={styles.logo}><i className="fa-solid fa-book-open"></i> ShareShelf</Link>
        <p style={{ color: '#6C757D', marginBottom: 30 }}>Welcome back, book lover!</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" style={styles.formControl} placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" style={styles.formControl} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" style={styles.btn}>Log In</button>
        </form>
        <p style={{ marginTop: 25, fontSize: 14 }}>Don't have an account? <Link to="/signup" style={{ color: '#E76F51', textDecoration: 'none', fontWeight: 700 }}>Join the revolution</Link></p>
        <div style={styles.demoHint}><strong>Demo Credentials:</strong><br />User: user@example.com / user123</div>
      </div>
    </div>
  );
};

export default Login;