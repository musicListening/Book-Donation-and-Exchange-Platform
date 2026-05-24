import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    // This talks to your local server first
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
      })
      .catch((err) => {
        console.error(err);
        setStatus("❌ Could not connect to backend");
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>Donation Platform</h1>
      <div style={{ padding: '20px', border: '1px solid #ccc', display: 'inline-block' }}>
        <h3>Backend Status:</h3>
        <p style={{ fontSize: '1.2rem' }}>{status}</p>
      </div>
    </div>
  );
}

export default App;