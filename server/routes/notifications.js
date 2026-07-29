const express = require('express');
const { prisma } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET all notifications for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH mark all notifications as read
router.patch('/mark-read', authenticate, async (req, res) => {
  try {
    const userId = req.auth.userId;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
