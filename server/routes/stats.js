const express = require('express');
const router = express.Router();
const { prisma, withRetry } = require('../db');

// GET /api/stats — public aggregate stats for the home page
router.get('/', async (req, res) => {
  try {
    const q = (fn) => withRetry(fn, 2).catch(() => null);

    await withRetry(() => prisma.$queryRaw`SELECT 1`, 3);
    await new Promise(r => setTimeout(r, 300));

    const totalBooksDonated = await q(() =>
      prisma.bookItem.count({ where: { isDonated: true } })
    );

    const totalActiveUsers = await q(() =>
      prisma.user.count({ where: { isActive: true } })
    );

    const totalPointsIssued = await q(() =>
      prisma.pointTransaction.aggregate({
        where: { type: { in: ['EARNED_DONATION', 'EARNED_SALE', 'EARNED_BONUS'] } },
        _sum: { amount: true },
      })
    );

    res.json({
      booksDonated: totalBooksDonated ?? 0,
      activeMembers: totalActiveUsers ?? 0,
      pointsEarned: totalPointsIssued?._sum?.amount ?? 0,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.json({ booksDonated: 0, activeMembers: 0, pointsEarned: 0 });
  }
});

module.exports = router;
