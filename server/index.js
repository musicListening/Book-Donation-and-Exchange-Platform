// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. ENABLE CORS (MUST BE AT THE VERY TOP, BEFORE ROUTES!)
app.use(cors({ origin: true, credentials: true }));

// 2. Parse JSON bodies (Also must be before routes)
app.use(express.json());

// 3. Import routes
const authRoutes = require('./routes/auth');

// Import CRUD routes
const taskRoutes = require('./routes/tasks');
const shipmentRoutes = require('./routes/shipments');
const collectionRoutes = require('./routes/collections');
const bookRoutes = require('./routes/books');
const donationRoutes = require('./routes/donations');
const orderRoutes = require('./routes/orders');

// 4. Register routes
app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

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

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🟢 Server running on http://localhost:${PORT}`);
    console.log(`📚 CRUD routes registered:`);
    console.log(`   - /api/tasks (Staff Dashboard)`);
    console.log(`   - /api/shipments (Order Fulfillment)`);
    console.log(`   - /api/collections (Bundle Management)`);
    console.log(`   - /api/books (Inventory Management)`);
    console.log(`   - /api/donations (Donation Schedule)`);
    console.log(`   - /api/orders (Order Fulfillment)`);
});