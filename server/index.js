// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { prisma, warmUpDb } = require('./db');
const app = express();

// 0. Security headers
app.use(helmet());

// 0b. Rate limiting — general API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// 1. ENABLE CORS (MUST BE AT THE VERY TOP, BEFORE ROUTES!)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://shareshelfbookdonation.netlify.app/',
  'https://book-donation-and-exchange-platform.onrender.com',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// 2. Parse JSON bodies and serve static uploads
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const statsRoutes = require('./routes/stats');
const communityRoutes = require('./routes/community');
const mysteryBoxRoutes = require('./routes/mysteryBoxes');
const reviewRoutes = require('./routes/reviews');
const craftRoutes = require('./routes/crafts');

// 3b. Auth middleware
const { authenticate, requireRole } = require('./middleware/auth');

// 4. Register routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, authenticate, userRoutes);
app.use('/api/admin', apiLimiter, authenticate, requireRole('PLATFORM_ADMIN'), adminRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/tasks', apiLimiter, authenticate, taskRoutes);
app.use('/api/shipments', apiLimiter, authenticate, shipmentRoutes);
app.use('/api/collections', apiLimiter, collectionRoutes);
app.use('/api/books', apiLimiter, bookRoutes);
app.use('/api/donations', apiLimiter, authenticate, donationRoutes);
app.use('/api/orders', apiLimiter, authenticate, orderRoutes);
app.use('/api/stats', apiLimiter, statsRoutes);
app.use('/api/community', apiLimiter, communityRoutes);
app.use('/api/mystery-boxes', apiLimiter, authenticate, mysteryBoxRoutes);
app.use('/api/crafts', apiLimiter, craftRoutes);

// 5. Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// 6. Connect to database and Start Server
const PORT = process.env.PORT || 5000;

warmUpDb()
  .then(() => {
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
  })
  .catch(err => {
    console.error('❌ Failed to start server due to DB connection error:', err);
    process.exit(1);
  });
