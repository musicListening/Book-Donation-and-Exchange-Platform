// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { prisma, warmUpDb } = require('./db');
const app = express();

// 1. ENABLE CORS (MUST BE AT THE VERY TOP, BEFORE ROUTES!)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://shareshelfplatform.netlify.app',
  'https://book-donation-and-exchange-platform.onrender.com',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all in dev; tighten in production
    }
  },
  credentials: true,
}));

// 2. Parse JSON bodies (Also must be before routes)
app.use(express.json());

// 3. Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const taskRoutes = require('./routes/tasks');
const shipmentRoutes = require('./routes/shipments');
const collectionRoutes = require('./routes/collections');
const bookRoutes = require('./routes/books');
const donationRoutes = require('./routes/donations');
const orderRoutes = require('./routes/orders');

// 4. Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// CRUD Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/orders', orderRoutes);

// 5. Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// 6. Connect to database and Start Server
const PORT = process.env.PORT || 5000;

warmUpDb();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🟢 Server running on http://localhost:${PORT}`);
    console.log(`📚 Registered API Routes:`);
    console.log(`   - [POST/GET] /api/auth/*`);
    console.log(`   - [GET/POST/PATCH/DELETE] /api/users/*`);
    console.log(`   - [GET] /api/admin/*`);
    console.log(`   - [GET/POST/PATCH/DELETE] /api/tasks`);
    console.log(`   - [GET/POST/PATCH/DELETE] /api/shipments`);
    console.log(`   - [GET/POST/PATCH/DELETE] /api/collections`);
    console.log(`   - [GET/POST/PATCH/DELETE] /api/books`);
    console.log(`   - [GET/POST/PATCH/DELETE] /api/donations`);
    console.log(`   - [GET/POST/PATCH/DELETE] /api/orders`);
    console.log(`   - [GET] /api/health`);
});