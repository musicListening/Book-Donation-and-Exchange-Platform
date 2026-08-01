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
  'https://shareshelfbookdonation.netlify.app',
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
const notificationRoutes = require('./routes/notifications');

// 3b. Auth middleware
const { authenticate, requireRole } = require('./middleware/auth');

// 4. Register routes
app.use('/api/auth', authLimiter, authRoutes);

// GET /api/users/me — returns the authenticated user's own data (no admin role required)
app.get('/api/users/me', apiLimiter, authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: {
        id: true, name: true, email: true, role: true,
        points: true, level: true, isActive: true,
        phoneNumber: true, address: true, createdAt: true, profileImage: true,
        status: true, activeOrders: true, booksDonated: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Fetch current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

const { uploadProfile, uploadToCloudinary } = require('./config/cloudinary');

// GET /api/users/delivery-personnel — fetch delivery drivers with active order counts (staff + admin)
app.get('/api/users/delivery-personnel', apiLimiter, authenticate, async (req, res) => {
  const MAX_ORDERS_PER_DRIVER = 5;
  try {
    const allDrivers = await prisma.user.findMany({
      where: { role: 'DELIVERY_PERSONNEL', isActive: true }
    });

    for (const driver of allDrivers) {
      const activeOrders = await prisma.order.count({
        where: {
          driverId: driver.id,
          status: { in: ['PENDING', 'PROCESSING'] }
        }
      });
      await prisma.user.update({
        where: { id: driver.id },
        data: {
          activeOrders,
          status: activeOrders === 0 ? 'AVAILABLE' : 'ACTIVE',
          updatedAt: new Date()
        }
      });
    }

    const deliveryPersonnel = await prisma.user.findMany({
      where: { role: 'DELIVERY_PERSONNEL', isActive: true },
      select: {
        id: true, name: true, email: true, phoneNumber: true,
        role: true, isActive: true, level: true, status: true, activeOrders: true
      },
      orderBy: { name: 'asc' }
    });

    const result = deliveryPersonnel.map(user => {
      const activeOrderCount = user.activeOrders || 0;
      return {
        ...user,
        status: activeOrderCount === 0 ? 'AVAILABLE' : 'ACTIVE',
        activeOrders: activeOrderCount,
        maxOrders: MAX_ORDERS_PER_DRIVER,
        canAcceptMore: activeOrderCount < MAX_ORDERS_PER_DRIVER,
        remainingCapacity: MAX_ORDERS_PER_DRIVER - activeOrderCount,
        isFull: activeOrderCount >= MAX_ORDERS_PER_DRIVER
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Fetch delivery personnel error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery personnel' });
  }
});

// PUT /api/users/me/profile — update own profile (name, profile image), no admin role required
app.put('/api/users/me/profile', apiLimiter, authenticate, (req, res, next) => {
  uploadProfile.single('profileImage')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Image must be under 10MB' });
      if (err.message) return res.status(400).json({ error: err.message });
      return res.status(400).json({ error: 'Upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name } = req.body;
    let profileImage = req.body.profileImage || null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      profileImage = result.secure_url;
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (profileImage !== null) updateData.profileImage = profileImage;

    const user = await prisma.user.update({
      where: { id: req.auth.userId },
      data: updateData,
      select: {
        id: true, name: true, email: true, role: true,
        points: true, level: true, isActive: true,
        phoneNumber: true, address: true, createdAt: true, profileImage: true,
        status: true, activeOrders: true, booksDonated: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error('Update own profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/:id/transactions — returns own point transactions, or all if admin
app.get('/api/users/:id/transactions', apiLimiter, authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.auth.userId !== id && req.auth.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    const transactions = await prisma.pointTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching point transactions:', error);
    res.status(500).json({ error: 'Failed to fetch point transactions' });
  }
});

app.use('/api/users', apiLimiter, authenticate, requireRole('PLATFORM_ADMIN'), userRoutes);

// GET /api/config — public config readable by any authenticated user (levels, mystery box costs etc.)
app.get('/api/config', apiLimiter, authenticate, async (req, res) => {
  try {
    const configs = await prisma.systemConfig.findMany();
    const map = {};
    for (const c of configs) {
      map[c.key] = c.value;
    }
    res.json(map);
  } catch (error) {
    console.error('Public config fetch error:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

app.get('/api/admin/config', apiLimiter, authenticate, requireRole('PLATFORM_ADMIN'), async (req, res) => {
  try {
    const { withRetry } = require('./db');
    const { prisma } = require('./db');
    await withRetry(() => prisma.$queryRaw`SELECT 1`, 2);
    const configs = await prisma.systemConfig.findMany();
    const map = {};
    for (const c of configs) {
      map[c.key] = c.value;
    }
    res.json(map);
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});
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
app.use('/api/notifications', apiLimiter, authenticate, notificationRoutes);

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
