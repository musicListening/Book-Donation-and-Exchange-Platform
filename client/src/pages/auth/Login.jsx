import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 2. Initialize navigate

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

      // 3. Save token and user data (including role!)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 4. Role-based Redirection Logic
      const userRole = data.user.role;
      
      if (userRole === 'PLATFORM_ADMIN') {
        navigate('/admin/AdminDashboard');
      } else if (userRole === 'OPERATIONS_STAFF') {
        navigate('/staff'); 
      } else if (userRole === 'DELIVERY_PERSONNEL') {
        navigate('/delivery/DeliveryPersonPage'); 
      } else if (userRole === 'COMMUNITY_ADMIN') {
        navigate('/community'); 
      } else {
        navigate('/'); 
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ color: '#1E4D4B' }}>Login to Book Platform</h2>
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600' }}>Email: </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
       
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600' }}>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
       
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#1E4D4B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;