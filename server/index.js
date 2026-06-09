const express = require("express");
const cors = require("cors");
const app = express();
const prisma = require('./db'); // If your main file is in a subfolder, adjust the path like '../db'

// Allow ANY website to talk to this server (Needed for Netlify + Render)
app.use(cors()); 
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Backend is running!" });
});
app.get('/api/test-db', async (req, res) => {
  try {
    // Try to connect and count how many users exist (it will be 0 right now)
    const userCount = await prisma.user.count();
    res.status(200).json({ 
      message: '✅ Backend is successfully connected to PostgreSQL!', 
      usersFound: userCount 
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    res.status(500).json({ error: 'Failed to connect to database', details: error.message });
  }
});

// Use the port provided by the environment (Render) or default to 5000 (Local)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🟢 Server running on port ${PORT}`));