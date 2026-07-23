const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { prisma } = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const MAX_ORDERS_PER_DRIVER = 5;

// Helper function to get driver's active order count
async function getDriverActiveOrders(driverId) {
  const count = await prisma.order.count({
    where: {
      driverId: driverId,
      status: { in: ['PENDING', 'PROCESSING'] }
    }
  });
  return count;
}

// Helper function to update driver status based on active orders
async function updateDriverStatus(driverId) {
  const activeOrders = await getDriverActiveOrders(driverId);
  
  const updated = await prisma.user.update({
    where: { id: driverId },
    data: {
      activeOrders: activeOrders,
      status: activeOrders === 0 ? 'AVAILABLE' : 'ACTIVE',
      updatedAt: new Date()
    }
  });
  
  return updated;
}

// 1. GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        points: true, level: true, isActive: true,
        phoneNumber: true, address: true, createdAt: true, profileImage: true,
        status: true, activeOrders: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// UPDATE USER PROFILE
router.put('/:id/profile', upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    let profileImage = req.body.profileImage; // In case it's a string URL fallback

    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, profileImage },
      select: {
        id: true, name: true, email: true, role: true,
        points: true, level: true, isActive: true,
        phoneNumber: true, address: true, createdAt: true, profileImage: true,
        status: true, activeOrders: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 1b. GET ALL DELETED USERS
router.get('/deleted', async (req, res) => {
  try {
    const deletedUsers = await prisma.deletedUser.findMany({
      orderBy: { deletedAt: 'desc' },
    });
    res.json(deletedUsers);
  } catch (error) {
    console.error("Fetch deleted users error:", error);
    res.status(500).json({ error: 'Failed to fetch deleted users' });
  }
});

// 2. GET DELIVERY PERSONNEL WITH ACTIVE ORDER COUNT
router.get('/delivery-personnel', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // First, sync all drivers to ensure counts are correct
    const allDrivers = await prisma.user.findMany({
      where: {
        role: 'DELIVERY_PERSONNEL',
        isActive: true
      }
    });

    // Sync each driver
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
          activeOrders: activeOrders,
          status: activeOrders === 0 ? 'AVAILABLE' : 'ACTIVE',
          updatedAt: new Date()
        }
      });
    }

    // Now fetch the updated list
    const deliveryPersonnel = await prisma.user.findMany({
      where: {
        role: 'DELIVERY_PERSONNEL',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        level: true,
        status: true,
        activeOrders: true
      },
      orderBy: { name: 'asc' }
    });

    const personnelWithStatus = deliveryPersonnel.map(user => {
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

    console.log(`📦 Delivery personnel: ${personnelWithStatus.length} found`);
    res.json(personnelWithStatus);
  } catch (error) {
    console.error("❌ Fetch delivery personnel error:", error);
    res.status(500).json({ error: 'Failed to fetch delivery personnel' });
  }
});

// 3. CREATE NEW USER
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'END_USER',
        phoneNumber,
        address,
        isActive: true,
        status: role === 'DELIVERY_PERSONNEL' ? 'AVAILABLE' : 'END_USER',
        activeOrders: 0
      }
    });

    // If it's a delivery personnel, update their status
    if (role === 'DELIVERY_PERSONNEL') {
      await updateDriverStatus(newUser.id);
    }

    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }
    console.error("Create user error:", error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 4. UPDATE USER DETAILS
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, points, phoneNumber, address, status } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(points !== undefined && { points }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(status !== undefined && { status }),
      }
    });

    // If this is a delivery personnel, sync their status
    if (updatedUser.role === 'DELIVERY_PERSONNEL') {
      await updateDriverStatus(id);
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: req.headers['x-admin-id'] || id,
        targetUserId: id,
        action: 'SYSTEM_CONFIG_CHANGE',
        details: `User ${user.name} details updated by admin`,
        metadata: { changes: Object.keys(req.body) }
      }
    });

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }
    console.error("Update user error:", error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// 5. TOGGLE USER ACTIVE STATUS
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive }
    });

    // If this is a delivery personnel and being activated, sync their status
    if (updatedUser.role === 'DELIVERY_PERSONNEL' && isActive) {
      await updateDriverStatus(id);
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: req.headers['x-admin-id'] || id,
        targetUserId: id,
        action: isActive ? 'USER_REACTIVATION' : 'USER_DEACTIVATION',
        details: `User ${user.name} ${isActive ? 'activated' : 'deactivated'} by admin`
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// 6. SOFT DELETE USER (archive to DeletedUser, then remove from User)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.headers['x-admin-id'] || null;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Copy user data to DeletedUser table before deleting
    await prisma.deletedUser.create({
      data: {
        originalId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
        phoneNumber: user.phoneNumber,
        address: user.address,
        isActive: user.isActive,
        status: user.status,
        activeOrders: user.activeOrders,
        createdAt: user.createdAt,
        originalCreatedAt: user.createdAt,
        deletedBy,
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: deletedBy || id,
        targetUserId: id,
        action: 'USER_DEACTIVATION',
        details: `User ${user.name} moved to deleted users by admin`
      }
    });

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User moved to deleted users successfully' });
  } catch (error) {
    console.error("Delete user error:", error);
    if (error.code === 'P2003' || error.code === 'P2014') {
      return res.status(409).json({ error: 'Cannot delete user with existing related records. Deactivate instead.' });
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 7. UPDATE DELIVERY PERSONNEL STATUS
router.patch('/:id/delivery-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        status: status,
        updatedAt: new Date()
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update delivery status error:", error);
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
});

// 8. SYNC ALL DRIVERS (Admin Tool)
router.post('/sync-drivers', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all delivery personnel
    const drivers = await prisma.user.findMany({
      where: {
        role: 'DELIVERY_PERSONNEL',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const results = [];
    
    for (const driver of drivers) {
      // Get actual active order count from orders table
      const activeOrderCount = await prisma.order.count({
        where: {
          driverId: driver.id,
          status: { in: ['PENDING', 'PROCESSING'] }
        }
      });

      // Update the driver
      const updated = await prisma.user.update({
        where: { id: driver.id },
        data: {
          activeOrders: activeOrderCount,
          status: activeOrderCount === 0 ? 'AVAILABLE' : 'ACTIVE',
          updatedAt: new Date()
        }
      });

      results.push({
        id: driver.id,
        name: driver.name,
        email: driver.email,
        activeOrders: activeOrderCount,
        status: updated.status,
        message: activeOrderCount === 0 ? 'Available' : `${activeOrderCount}/${MAX_ORDERS_PER_DRIVER} orders`
      });
    }

    console.log(`✅ Synced ${drivers.length} drivers`);
    res.json({
      message: `Successfully synced ${drivers.length} drivers`,
      drivers: results,
      totalDrivers: drivers.length
    });
  } catch (error) {
    console.error('❌ Sync error:', error);
    res.status(500).json({ error: 'Failed to sync drivers: ' + error.message });
  }
});

// 9. GET DRIVER DETAILS WITH ORDER COUNT
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        activeOrders: true,
        isActive: true,
        phoneNumber: true,
        address: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get actual active order count from orders
    const activeOrderCount = await prisma.order.count({
      where: {
        driverId: id,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    // Get all orders for this driver
    const orders = await prisma.order.findMany({
      where: { driverId: id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        totalPoints: true,
        cashAmount: true,
        shippingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      driver: {
        ...user,
        activeOrders: activeOrderCount,
        maxOrders: MAX_ORDERS_PER_DRIVER,
        remainingCapacity: MAX_ORDERS_PER_DRIVER - activeOrderCount,
        isFull: activeOrderCount >= MAX_ORDERS_PER_DRIVER
      },
      orders: {
        total: orders.length,
        active: orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING'),
        completed: orders.filter(o => o.status === 'COMPLETED'),
        cancelled: orders.filter(o => o.status === 'CANCELLED')
      }
    });
  } catch (error) {
    console.error('Error fetching driver details:', error);
    res.status(500).json({ error: 'Failed to fetch driver details' });
  }
});

module.exports = router;