import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
    if (users.find(u => u.email === formData.email)) {
      alert('Email already exists');
      return;
    }
    const newUser = { id: Date.now(), ...formData, role: 'user', points: 50, level: 'Book Lover' };
    delete newUser.confirmPassword;
    users.push(newUser);
    localStorage.setItem('ss_users', JSON.stringify(users));
    localStorage.setItem('ss_current_user', JSON.stringify(newUser));
    navigate('/user-dashboard');
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', margin: 0 },
    signupContainer: { width: '100%', maxWidth: 500, background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
    logo: { fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 800, color: '#1E4D4B', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 },
    formGroup: { marginBottom: 20 },
    label: { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#343A40' },
    formControl: { width: '100%', padding: '12px 16px', border: '2px solid #DEE2E6', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15 },
    btn: { width: '100%', padding: 14, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', backgroundColor: '#1E4D4B', color: 'white', marginTop: 10 }
  };

  return (
    <div style={styles.body}>
      <div style={styles.signupContainer}>
        <Link to="/" style={styles.logo}><i className="fa-solid fa-book-open"></i> ShareShelf</Link>
        <p style={{ textAlign: 'center', color: '#6C757D', marginBottom: 30 }}>Join the reading revolution!</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}><label style={styles.label}>Full Name</label><input type="text" style={styles.formControl} required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Email Address</label><input type="email" style={styles.formControl} required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Phone Number</label><input type="tel" style={styles.formControl} required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Password</label><input type="password" style={styles.formControl} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Confirm Password</label><input type="password" style={styles.formControl} required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} /></div>
          <button type="submit" style={styles.btn}>Create Account</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 25, fontSize: 14 }}>Already have an account? <Link to="/login" style={{ color: '#E76F51', textDecoration: 'none', fontWeight: 700 }}>Log in</Link></p>
      </div>
    </div>
  );
};

export default Signup;