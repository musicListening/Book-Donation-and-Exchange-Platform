import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // We hardcode the role to 'END_USER' so public users can only register as customers!
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'END_USER' }), 
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login page after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ color: '#1E4D4B', textAlign: 'center', marginBottom: '5px' }}>Customer Registration</h2>
      <p style={{ textAlign: 'center', color: '#767777', marginBottom: '20px', fontSize: '14px' }}>
        Join us to donate books, earn rewards, and exchange crafts!
      </p>
      
      {error && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Full Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Enter your full name"
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="your.email@example.com"
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Create a secure password"
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: '#1E4D4B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}
        >
          {loading ? 'Creating Account...' : 'Sign Up as Customer'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#767777', fontSize: '14px' }}>
        Already have an account? <a href="/login" style={{ color: '#1E4D4B', fontWeight: 'bold', textDecoration: 'none' }}>Login here</a>
      </p>
    </div>
  );
};

export default Register;