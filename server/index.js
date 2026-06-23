require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. ENABLE CORS (MUST BE AT THE VERY TOP, BEFORE ROUTES!)
app.use(cors({ origin: true, credentials: true }));

// 2. Parse JSON bodies (Also must be before routes)
app.use(express.json()); 

// 3. Import and use the auth routes
const authRoutes = require('./routes/auth'); 
app.use('/api/auth', authRoutes);

// 4. Start Server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🟢 Server running on http://localhost:${PORT}`);
});