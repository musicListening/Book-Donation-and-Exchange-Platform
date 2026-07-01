// server/routes/donations.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Helper: calculate points for a donation based on system config
async function calculatePoints(verifiedCount, type) {
  const configs = await prisma.systemConfig.findMany();
  const config = {};
  for (const c of configs) config[c.key] = c.value;

  const basePerBook = parseInt(config.BASE_POINTS_PER_BOOK) || 10;
  const collectionBonus = parseInt(config.COLLECTION_BONUS_PERCENTAGE) || 10;

  let points = verifiedCount * basePerBook;
  if (type === 'COLLECTION') {
    points += Math.round(points * collectionBonus / 100);
  }
  return points;
}

// Helper: recalculate user level based on total points
async function recalculateLevel(userId) {
  const configs = await prisma.systemConfig.findMany();
  const config = {};
  for (const c of configs) config[c.key] = c.value;

  let thresholds;
  try {
    thresholds = JSON.parse(config.LEVEL_THRESHOLDS || '[]');
  } catch {
    thresholds = [];
  }

  if (thresholds.length === 0) {
    thresholds = [
      { level: 1, minPoints: 0, name: 'Book Lover' },
      { level: 2, minPoints: 250, name: 'Bibliophile' },
      { level: 3, minPoints: 750, name: 'Grand Librarian' },
      { level: 4, minPoints: 2000, name: 'Literary Elite' },
      { level: 5, minPoints: 5000, name: 'Legendary Reader' },
    ];
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  let newLevel = 1;
  let oldLevel = user.level || 1;

  for (const t of thresholds) {
    if (user.points >= t.minPoints) {
      newLevel = t.level;
    }
  }

  if (newLevel !== oldLevel) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });

    // Create level-up notification
    const levelName = thresholds.find(t => t.level === newLevel)?.name || `Level ${newLevel}`;
    await prisma.notification.create({
      data: {
        userId,
        type: 'LEVEL_UP',
        title: 'Level Up!',
        message: `Congratulations! You've reached ${levelName}!`,
      },
    });
  }
}

// ===== CREATE Donation Request =====
router.post('/', async (req, res) => {
    try {
        const { userId, type, collectionName, category, requestedCount, notes, dropOffDate } = req.body;

        const donation = await prisma.donationRequest.create({
            data: {
                userId,
                type,
                collectionName,
                category,
                requestedCount: parseInt(requestedCount),
                verifiedCount: 0,
                notes,
                dropOffDate: dropOffDate ? new Date(dropOffDate) : null,
                pointsAwarded: 0,
            }
        });

        res.status(201).json(donation);
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== READ ALL Donations =====
router.get('/', async (req, res) => {
    try {
        const { userId, status } = req.query;
        const where = {};
        if (userId) where.userId = userId;
        // Add status filtering if needed

        const donations = await prisma.donationRequest.findMany({
            where,
            include: { books: true, user: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== UPDATE Donation (with verification & points awarding) =====
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, collectionName, category, requestedCount, verifiedCount, verifiedDate, verifiedBy, notes, dropOffDate } = req.body;

        const existing = await prisma.donationRequest.findUnique({ where: { id } });

        const data = {};
        if (type !== undefined) data.type = type;
        if (collectionName !== undefined) data.collectionName = collectionName;
        if (category !== undefined) data.category = category;
        if (requestedCount !== undefined) data.requestedCount = parseInt(requestedCount);
        if (notes !== undefined) data.notes = notes;
        if (dropOffDate !== undefined) data.dropOffDate = dropOffDate ? new Date(dropOffDate) : null;
        if (verifiedDate !== undefined) data.verifiedDate = verifiedDate ? new Date(verifiedDate) : null;

        let pointsAwarded = existing.pointsAwarded || 0;

        // If verification just happened (verifiedCount changed from 0 to >0)
        if (verifiedCount !== undefined && verifiedCount > 0 && (!existing.verifiedCount || existing.verifiedCount === 0)) {
            data.verifiedCount = parseInt(verifiedCount);
            pointsAwarded = await calculatePoints(parseInt(verifiedCount), type || existing.type);
            data.pointsAwarded = pointsAwarded;
            data.verifiedDate = verifiedDate ? new Date(verifiedDate) : new Date();
            data.verifiedBy = verifiedBy || null;

            const updated = await prisma.donationRequest.update({
                where: { id },
                data,
            });

            // Award points to user
            if (pointsAwarded > 0) {
                await prisma.pointTransaction.create({
                    data: {
                        userId: existing.userId,
                        type: 'EARNED_DONATION',
                        amount: pointsAwarded,
                        description: `Points awarded for donation verification (${verifiedCount} books)`,
                        relatedDonationId: id,
                        staffId: verifiedBy || null,
                    },
                });

                // Update user points
                await prisma.user.update({
                    where: { id: existing.userId },
                    data: { points: { increment: pointsAwarded } },
                });

                // Recalculate level
                await recalculateLevel(existing.userId);
            }

            return res.json(updated);
        }

        // Regular (non-verification) update
        if (verifiedCount !== undefined) data.verifiedCount = parseInt(verifiedCount);
        const updated = await prisma.donationRequest.update({
            where: { id },
            data,
            include: { books: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating donation:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== DELETE Donation =====
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.donationRequest.delete({ where: { id } });
        res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;