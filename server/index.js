// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { prisma, warmUpDb } = require('./db');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // We can tighten this in production
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Expose io to routes
app.locals.io = io;

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When client identifies themselves
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

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
const notificationRoutes = require('./routes/notifications');

// 4. Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// CRUD Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/mystery-boxes', mysteryBoxRoutes);
app.use('/api/notifications', notificationRoutes);

// 5. Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// 6. Connect to database// 7. Start server using the HTTP server (not app.listen directly)
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await warmUpDb();
    console.log(`🟢 Server running on http://localhost:${PORT}`);
    // Log registered API routes
  console.log('📚 Registered API Routes:');
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
    } catch (err) {
      console.error('❌ Failed to start server due to DB connection error:', err);
      process.exit(1);
    }
});
