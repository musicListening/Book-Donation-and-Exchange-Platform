// server/routes/users.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET ALL USERS (Fetches real data for your table)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, 
        points: true, level: true, isActive: true, 
        phoneNumber: true, address: true, createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 2. CREATE NEW USER (For the "Add New User" button)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, address } = req.body;
       const hashedPassword = password; // Temporary plain text for testing

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

// 3. TOGGLE USER STATUS (For the "Deactivate" button)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// 4. DELETE USER PERMANENTLY (For the "Delete" button)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;