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

// GET /api/stats/leaderboard — public top book donors for the home page
router.get('/leaderboard', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  try {
    const donors = await withRetry(() =>
      prisma.user.findMany({
        where: {
          isActive: true,
          role: 'END_USER',
          booksDonated: { gt: 0 },
        },
        // Ties on book count fall back to points, then to whoever joined first,
        // so the ranking stays stable between requests.
        orderBy: [{ booksDonated: 'desc' }, { points: 'desc' }, { createdAt: 'asc' }],
        take: limit,
        select: {
          id: true,
          name: true,
          profileImage: true,
          booksDonated: true,
          points: true,
          level: true,
        },
      })
    , 2);

    // Map the numeric level onto its configured tier name, e.g. 3 -> "Literary Elite"
    const levels = await withRetry(() => prisma.level.findMany({ orderBy: { level: 'asc' } }), 2);
    const levelNames = new Map(levels.map(l => [l.level, l.name.trim()]));

    res.json(
      donors.map((u, idx) => ({
        rank: idx + 1,
        ...u,
        name: u.name.trim(),
        levelName: levelNames.get(u.level) || 'New Donor',
      }))
    );
  } catch (error) {
    // Match /api/stats: an empty board is better than a broken home page.
    console.error('Leaderboard fetch error:', error);
    res.json([]);
  }
});

module.exports = router;
