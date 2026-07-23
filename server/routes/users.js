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

// 1. GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        points: true, level: true, isActive: true,
        phoneNumber: true, address: true, createdAt: true, profileImage: true
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
        phoneNumber: true, address: true, createdAt: true, profileImage: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: 'Failed to update profile' });
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
        isActive: true
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
    const { name, email, role, points, phoneNumber, address } = req.body;

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

// 4. TOGGLE USER STATUS
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

module.exports = router;
