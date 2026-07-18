// server/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { prisma } = require('../db');

// 1. GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        points: true, level: true, isActive: true,
        phoneNumber: true, address: true, createdAt: true,
        status: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 1.5 GET DELIVERY PERSONNEL ONLY
router.get('/delivery-personnel', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
        status: true
      },
      orderBy: { name: 'asc' }
    });

    // Ensure each driver has a status (default to AVAILABLE if null)
    const personnelWithStatus = deliveryPersonnel.map(user => ({
      ...user,
      status: user.status || 'AVAILABLE'
    }));

    console.log('✅ Delivery personnel found:', personnelWithStatus.length);
    res.json(personnelWithStatus);
  } catch (error) {
    console.error("Fetch delivery personnel error:", error);
    res.status(500).json({ error: 'Failed to fetch delivery personnel' });
  }
});

// 2. CREATE NEW USER
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
        status: 'AVAILABLE'
      }
    });
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }
    console.error("Create user error:", error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 3. UPDATE USER DETAILS (name, email, role, points)
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

// 4. TOGGLE USER ACTIVE STATUS
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

// 5. DELETE USER PERMANENTLY
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await prisma.auditLog.create({
      data: {
        actorUserId: req.headers['x-admin-id'] || id,
        targetUserId: id,
        action: 'USER_DEACTIVATION',
        details: `User ${user.name} permanently deleted by admin`
      }
    });

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Delete user error:", error);
    if (error.code === 'P2003' || error.code === 'P2014') {
      return res.status(409).json({ error: 'Cannot delete user with existing related records. Deactivate instead.' });
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 6. UPDATE DELIVERY PERSONNEL STATUS
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

module.exports = router;
