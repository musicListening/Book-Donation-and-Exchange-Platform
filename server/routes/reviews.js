const express = require('express');
const router = express.Router();
const { prisma } = require('../db');

// GET top 3 approved reviews for the homepage
router.get('/top', async (req, res) => {
  try {
    const reviews = await prisma.platformReview.findMany({
      where: { isApproved: true },
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

// GET all reviews for admin
router.get('/admin/all', async (req, res) => {
  try {
    const reviews = await prisma.platformReview.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Server error fetching all reviews' });
  }
});

// PATCH toggle approval status
router.patch('/admin/:id/approve', async (req, res) => {
  try {
    const review = await prisma.platformReview.findUnique({
      where: { id: req.params.id }
    });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const updated = await prisma.platformReview.update({
      where: { id: req.params.id },
      data: { isApproved: !review.isApproved },
      include: {
        user: {
          select: { id: true, name: true, email: true, profileImage: true }
        }
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error toggling review approval:', error);
    res.status(500).json({ message: 'Server error toggling review approval' });
  }
});

// DELETE a review
router.delete('/admin/:id', async (req, res) => {
  try {
    await prisma.platformReview.delete({ where: { id: req.params.id } });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error deleting review' });
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

// POST create or update review (new reviews start unapproved)
router.post('/', async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const existing = await prisma.platformReview.findUnique({ where: { userId } });

    const review = await prisma.platformReview.upsert({
      where: { userId: userId },
      update: {
        rating,
        comment,
        isApproved: false
      },
      create: {
        userId: userId,
        rating,
        comment,
        isApproved: false
      }
    });

    res.json(review);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Server error saving review', error: error.message });
  }
});

module.exports = router;
