const express = require('express');
const { prisma } = require('../db');
const router = express.Router();

router.get('/user/:userId', async (req, res) => {
  try {
    const boxes = await prisma.mysteryBox.findMany({
      where: { userId: req.params.userId },
      include: { books: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(boxes);
  } catch (error) {
    console.error('Error fetching mystery boxes:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const mysteryBox = await prisma.mysteryBox.findUnique({ where: { id } });
    if (!mysteryBox) return res.status(404).json({ error: 'Mystery box not found' });
    if (mysteryBox.status === 'CLAIMED') return res.status(400).json({ error: 'Already claimed' });

    const updated = await prisma.mysteryBox.update({
      where: { id },
      data: { status: 'CLAIMED', claimedAt: new Date() },
      include: { books: true }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error claiming mystery box:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
