const express = require('express');
const router = express.Router();
const { prisma } = require('../db');

// GET top 3 highest rated and recent reviews for the homepage
router.get('/top', async (req, res) => {
  try {
    const reviews = await prisma.platformReview.findMany({
      take: 3,
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            name: true,
            profileImage: true
          }
        }
      }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching top reviews:', error);
    res.status(500).json({ message: 'Server error fetching top reviews' });
  }
});

// GET current user's review
router.get('/me/:userId', async (req, res) => {
  try {
    const review = await prisma.platformReview.findUnique({
      where: { userId: req.params.userId }
    });
    res.json(review);
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({ message: 'Server error fetching user review' });
  }
});

// POST create or update review
router.post('/', async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await prisma.platformReview.upsert({
      where: { userId: userId },
      update: {
        rating,
        comment
      },
      create: {
        userId: userId,
        rating,
        comment
      }
    });

    res.json(review);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Server error saving review', error: error.message });
  }
});

module.exports = router;
