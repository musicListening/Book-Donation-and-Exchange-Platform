const express = require('express');
const router = express.Router();
const { prisma, withRetry } = require('../db');

// GET /api/admin/dashboard — aggregate stats for the admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Helper to run a query with retry, return null on failure
    const q = (fn) => withRetry(fn, 2).catch(() => null);

    // Warm up connection for Neon cold starts
    await withRetry(() => prisma.$queryRaw`SELECT 1`, 3);
    // Small delay to let Neon fully wake
    await new Promise(r => setTimeout(r, 500));

    // Run queries sequentially (not in parallel) to avoid overwhelming Neon free tier
    const totalUsers = await q(() => prisma.user.count({ where: { isActive: true } }));
    const totalDonations = await q(() => prisma.donationRequest.count());
    const verifiedDonations = await q(() => prisma.donationRequest.count({ where: { verifiedCount: { gt: 0 } } }));
    const totalBooks = await q(() => prisma.bookItem.count({ where: { isDonated: true } }));
    const totalOrders = await q(() => prisma.order.count());
    const completedOrders = await q(() => prisma.order.count({ where: { status: 'COMPLETED' } }));
    const totalPointsIssued = await q(() => prisma.pointTransaction.aggregate({
      where: { type: { in: ['EARNED_DONATION', 'EARNED_SALE', 'EARNED_BONUS'] } },
      _sum: { amount: true }
    }));
    const totalPointsSpent = await q(() => prisma.pointTransaction.aggregate({
      where: { type: { in: ['SPENT_BOOK', 'SPENT_CRAFT'] } },
      _sum: { amount: true }
    }));
    const recentDonations = await q(() => prisma.donationRequest.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    }));
    const genreDistribution = await q(() => prisma.bookItem.groupBy({
      by: ['genre'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }));
    const dailyDonations = await q(() => prisma.$queryRaw`
      SELECT
        to_char("createdAt", 'YYYY-MM-DD') as date_key,
        to_char("createdAt", 'Mon DD') as label,
        COUNT(*)::int as count,
        COALESCE(SUM("verifiedCount"), 0)::int as books
      FROM "DonationRequest"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY date_key, label
      ORDER BY date_key ASC
    `);
    const monthlyDonations = await q(() => prisma.$queryRaw`
      SELECT
        to_char("createdAt", 'Mon') as month,
        to_char("createdAt", 'YYYY-MM') as month_key,
        COUNT(*)::int as count,
        COALESCE(SUM("verifiedCount"), 0)::int as books
      FROM "DonationRequest"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_key
      ORDER BY month_key ASC
    `);
    const yearlyDonations = await q(() => prisma.$queryRaw`
      SELECT
        to_char("createdAt", 'YYYY') as year,
        COUNT(*)::int as count,
        COALESCE(SUM("verifiedCount"), 0)::int as books
      FROM "DonationRequest"
      WHERE "createdAt" >= NOW() - INTERVAL '5 years'
      GROUP BY year
      ORDER BY year ASC
    `);
    const topDonors = await q(() => prisma.donationRequest.groupBy({
      by: ['userId'],
      _count: { id: true },
      _sum: { pointsAwarded: true, verifiedCount: true },
      orderBy: { _sum: { verifiedCount: 'desc' } },
      take: 5,
    }));
    const craftCount = await q(() => prisma.craftListing.count());
    const craftSold = await q(() => prisma.craftListing.count({ where: { status: 'SOLD' } }));

    const totalPointsIssuedVal = totalPointsIssued?._sum?.amount || 0;
    const totalPointsSpentVal = totalPointsSpent?._sum?.amount || 0;

    // Map top donors with user info
    const topDonorIds = (topDonors || []).map(d => d.userId);
    const donorUsers = topDonorIds.length > 0
      ? await q(() => prisma.user.findMany({ where: { id: { in: topDonorIds } }, select: { id: true, name: true } })) || []
      : [];
    const donorMap = Object.fromEntries(donorUsers.map(u => [u.id, u.name]));

    // Build daily chart (last 30 days)
    const dailyChart = [];
    const now = new Date();
    const dailyData = dailyDonations || [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const found = dailyData.find(r => r.date_key === key);
      dailyChart.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        donations: found ? Number(found.count) : 0,
        books: found ? Number(found.books) : 0,
      });
    }

    // Build monthly chart (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyChart = [];
    const monthlyData = monthlyDonations || [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = monthNames[d.getMonth()];
      const found = monthlyData.find(r => r.month_key === key);
      monthlyChart.push({
        label,
        donations: found ? Number(found.count) : 0,
        books: found ? Number(found.books) : 0,
      });
    }

    // Build yearly chart (last 5 years)
    const yearlyChart = [];
    const yearlyData = yearlyDonations || [];
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const found = yearlyData.find(r => r.year === String(year));
      yearlyChart.push({
        label: String(year),
        donations: found ? Number(found.count) : 0,
        books: found ? Number(found.books) : 0,
      });
    }

    res.json({
      stats: {
        totalBooksDonated: totalBooks || 0,
        activeReaders: totalUsers || 0,
        pointsIssued: totalPointsIssuedVal,
        pointsSpent: totalPointsSpentVal,
        totalOrders: totalOrders || 0,
        completedOrders: completedOrders || 0,
        totalDonations: totalDonations || 0,
        verifiedDonations: verifiedDonations || 0,
        verificationRate: totalDonations > 0
          ? Math.round(((verifiedDonations || 0) / totalDonations) * 100 * 10) / 10
          : 0,
        craftListings: craftCount || 0,
        craftSold: craftSold || 0,
      },
      genreDistribution: (genreDistribution || []).map(g => ({
        name: g.genre || 'Uncategorized',
        count: g._count.id,
      })),
      dailyPerformance: dailyChart,
      monthlyPerformance: monthlyChart,
      yearlyPerformance: yearlyChart,
      recentDonations: (recentDonations || []).map(d => ({
        id: d.id.substring(0, 8).toUpperCase(),
        donor: d.user?.name || 'Unknown',
        email: d.user?.email || '',
        quantity: `${d.verifiedCount} / ${d.requestedCount} books`,
        status: d.verifiedCount >= d.requestedCount ? 'Verified' : 'Pending',
        points: `+${d.pointsAwarded} pts`,
        date: d.createdAt.toISOString().split('T')[0],
      })),
      topDonors: (topDonors || []).map(d => ({
        name: donorMap[d.userId] || 'Unknown',
        donations: d._count.id,
        books: d._sum.verifiedCount || 0,
        points: d._sum.pointsAwarded || 0,
      })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// ===== SYSTEM CONFIGURATION =====

// GET /api/admin/config — fetch all system config as key-value pairs
router.get('/config', async (req, res) => {
  try {
    await withRetry(() => prisma.$queryRaw`SELECT 1`, 2);
    const configs = await prisma.systemConfig.findMany();
    const map = {};
    for (const c of configs) {
      map[c.key] = c.value;
    }
    res.json(map);
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

// PUT /api/admin/config — upsert system config values
router.put('/config', async (req, res) => {
  try {
    const entries = req.body; // { key: value, ... }
    const updatedBy = req.headers['x-user-id'] || null;

    for (const [key, value] of Object.entries(entries)) {
      await prisma.systemConfig.upsert({
        where: { key },
        update: { value: String(value), updatedBy, updatedAt: new Date() },
        create: { key, value: String(value), updatedBy },
      });
    }

    // Return updated config
    const configs = await prisma.systemConfig.findMany();
    const map = {};
    for (const c of configs) {
      map[c.key] = c.value;
    }
    res.json(map);
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

module.exports = router;
