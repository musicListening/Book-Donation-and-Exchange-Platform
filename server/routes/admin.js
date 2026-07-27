const express = require('express');
const router = express.Router();
const { prisma, withRetry } = require('../db');

function safeJson(str) {
  try { return JSON.parse(str); } catch { return null; }
}

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
    const totalCashEarned = await q(() => prisma.order.aggregate({
      where: { NOT: { status: 'CANCELLED' } },
      _sum: { cashAmount: true, totalPoints: true }
    }));
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
    const rawCash = totalCashEarned?._sum?.cashAmount || 0;
    const rawPointsInOrders = totalCashEarned?._sum?.totalPoints || 0;
    // 10 points = 1 LKR as per system conversion rules, so points spent on book orders contribute to total order value in LKR
    const totalEarnedLKRVal = Math.round((rawCash + (rawPointsInOrders * 0.1)) * 100) / 100;
    const totalEarnedRupeesVal = Math.round(totalEarnedLKRVal * 0.27 * 100) / 100;

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
        totalEarnedLKR: totalEarnedLKRVal,
        totalEarnedRupees: totalEarnedRupeesVal,
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

// GET /api/admin/report — generate reports with real data from database
router.get('/report', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    await withRetry(() => prisma.$queryRaw`SELECT 1`, 2);
    await new Promise(r => setTimeout(r, 300));

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }
    const hasDateFilter = startDate || endDate;

    if (!type || type === 'Total Points Provided') {
      const donationPoints = await prisma.donationRequest.groupBy({
        by: ['type'],
        where: hasDateFilter ? { createdAt: dateFilter } : {},
        _sum: { pointsAwarded: true },
      });
      const spentBook = await prisma.pointTransaction.aggregate({
        where: { type: 'SPENT_BOOK', ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
        _sum: { amount: true },
      });
      const spentCraft = await prisma.pointTransaction.aggregate({
        where: { type: 'SPENT_CRAFT', ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
        _sum: { amount: true },
      });
      const earnedBonus = await prisma.pointTransaction.aggregate({
        where: { type: 'EARNED_BONUS', ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
        _sum: { amount: true },
      });
      const earnedDonation = await prisma.pointTransaction.aggregate({
        where: { type: 'EARNED_DONATION', ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
        _sum: { amount: true },
      });

      const single = donationPoints.find(d => d.type === 'SINGLE_BOOK');
      const collection = donationPoints.find(d => d.type === 'COLLECTION');
      const singlePoints = single?._sum?.pointsAwarded || 0;
      const collectionPoints = collection?._sum?.pointsAwarded || 0;
      const bonusPoints = earnedBonus._sum?.amount || 0;
      const extraDonationPoints = earnedDonation._sum?.amount || 0;
      const bookSpent = spentBook._sum?.amount || 0;
      const craftSpent = spentCraft._sum?.amount || 0;

      const totalIssued = singlePoints + collectionPoints + bonusPoints + extraDonationPoints;
      const totalRedeemed = bookSpent + craftSpent;
      const netBalance = totalIssued - totalRedeemed;
      const max = Math.max(totalIssued, totalRedeemed, 1);

      return res.json({
        title: 'Points Distribution & Redemption Report',
        subtitle: 'Summary of points issued, redeemed, and remaining platform balances',
        headers: ['Category', 'Points Issued', 'Points Redeemed', 'Net Balance'],
        rows: [
          { col1: 'Single Book Donations', col2: singlePoints.toLocaleString(), col3: '0', col4: `+${singlePoints.toLocaleString()}` },
          { col1: 'Collection Donations (w/ Bonus)', col2: (collectionPoints + bonusPoints).toLocaleString(), col3: '0', col4: `+${(collectionPoints + bonusPoints).toLocaleString()}` },
          { col1: 'Book Marketplace Purchases', col2: '0', col3: bookSpent.toLocaleString(), col4: `-${bookSpent.toLocaleString()}` },
          { col1: 'Craft Marketplace Purchases', col2: '0', col3: craftSpent.toLocaleString(), col4: `-${craftSpent.toLocaleString()}` },
          { col1: 'Total Platform Points', col2: totalIssued.toLocaleString(), col3: totalRedeemed.toLocaleString(), col4: netBalance.toLocaleString() },
        ],
        chartData: [
          { label: 'Issued', val: Math.round(totalIssued / max * 100), color: '#1E4D4B' },
          { label: 'Redeemed', val: Math.round(totalRedeemed / max * 100), color: '#E9C46A' },
        ],
      });
    }

    if (type === 'Total Deliveries') {
      const orders = await prisma.order.findMany({
        where: hasDateFilter ? { createdAt: dateFilter } : {},
        include: { items: true },
      });

      const statusMap = { PENDING: 'Order Confirmed', PROCESSING: 'Processed & Packed', COMPLETED: 'Delivered', CANCELLED: 'Cancelled' };
      const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
      const counts = {};
      for (const s of statuses) counts[s] = { book: 0, craft: 0 };

      for (const order of orders) {
        const s = order.status;
        if (!counts[s]) counts[s] = { book: 0, craft: 0 };
        for (const item of order.items || []) {
          if (item.collectionId || item.bookItemId) counts[s].book += item.quantity;
          if (item.craftListingId) counts[s].craft += item.quantity;
        }
      }

      let totalBook = 0, totalCraft = 0;
      const rows = [];
      for (const s of statuses) {
        const b = counts[s]?.book || 0;
        const c = counts[s]?.craft || 0;
        totalBook += b; totalCraft += c;
        rows.push({ col1: statusMap[s] || s, col2: b.toLocaleString(), col3: c.toLocaleString(), col4: (b + c).toLocaleString() });
      }
      rows.push({ col1: 'Total Deliveries', col2: totalBook.toLocaleString(), col3: totalCraft.toLocaleString(), col4: (totalBook + totalCraft).toLocaleString() });

      const maxVal = Math.max(totalBook, totalCraft, 1);
      return res.json({
        title: 'Delivery & Fulfillment Status Report',
        subtitle: 'Real-time tracking of book and craft shipments across all stages',
        headers: ['Status Stage', 'Book Orders', 'Craft Orders', 'Total'],
        rows,
        chartData: [
          { label: 'Books', val: Math.round(totalBook / maxVal * 100), color: '#1E4D4B' },
          { label: 'Crafts', val: Math.round(totalCraft / maxVal * 100), color: '#E9C46A' },
        ],
      });
    }

    if (type === 'Most Popular Collections') {
      const orderItems = await prisma.orderItem.findMany({
        where: {
          collectionId: { not: null },
          ...(hasDateFilter ? { order: { createdAt: dateFilter } } : {}),
        },
        include: { collection: true },
      });

      const collectionMap = {};
      for (const item of orderItems) {
        if (!item.collection) continue;
        const id = item.collectionId;
        if (!collectionMap[id]) collectionMap[id] = { name: item.collection.title, category: item.collection.category, units: 0 };
        collectionMap[id].units += item.quantity;
      }

      const sorted = Object.values(collectionMap).sort((a, b) => b.units - a.units).slice(0, 5);
      const maxUnits = Math.max(...sorted.map(s => s.units), 1);
      const colors = ['#1E4D4B', '#E9C46A', '#643C29', '#767777', '#2A9D8F'];
      const demand = (u) => u > maxUnits * 0.7 ? 'High' : u > maxUnits * 0.4 ? 'Medium' : 'Low';

      return res.json({
        title: 'Top Performing Book Collections',
        subtitle: 'Most requested and curated book bundles by genre',
        headers: ['Collection Name', 'Category', 'Units Sold', 'Demand Trend'],
        rows: sorted.map(s => ({ col1: s.name, col2: s.category, col3: s.units.toLocaleString(), col4: demand(s.units) })),
        chartData: sorted.map((s, i) => ({ label: s.category, val: Math.round(s.units / maxUnits * 100), color: colors[i % colors.length] })),
      });
    }

    if (type === 'Top Users Who Level Up') {
      const users = await prisma.user.findMany({
        where: { role: 'END_USER', isActive: true },
        orderBy: [{ level: 'desc' }, { points: 'desc' }],
        take: 10,
      });

      const userIds = users.map(u => u.id);
      const donationCounts = await prisma.donationRequest.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _sum: { verifiedCount: true },
      });
      const countMap = {};
      for (const d of donationCounts) countMap[d.userId] = d._sum.verifiedCount || 0;

      const levelNames = ['', 'Book Lover', 'Bibliophile', 'Grand Librarian', 'Literary Elite', 'Legendary Reader'];
      const nextUnlocks = ['Level 2', 'Level 3', 'Level 4', 'Level 5', 'All Unlocked'];
      const lvls = [0, 0, 0, 0, 0, 0];
      const rows = users.map(u => {
        lvls[u.level]++;
        return {
          col1: u.email,
          col2: `${countMap[u.id] || 0} Books`,
          col3: `Level ${u.level} (${levelNames[u.level] || 'Reader'})`,
          col4: u.level >= 5 ? 'All Unlocked' : nextUnlocks[u.level - 1] || 'Level Up',
        };
      });

      const total = users.length || 1;
      const chartData = [
        { label: 'Lvl 5', val: Math.round(lvls[5] / total * 100), color: '#1E4D4B' },
        { label: 'Lvl 4', val: Math.round(lvls[4] / total * 100), color: '#E9C46A' },
        { label: 'Lvl 3', val: Math.round(lvls[3] / total * 100), color: '#643C29' },
        { label: 'Lvl 1-2', val: Math.round((lvls[1] + lvls[2]) / total * 100), color: '#767777' },
      ];

      return res.json({
        title: 'Top Users & Level Progression Report',
        subtitle: 'Leaderboard of most active donors and their unlocked tier benefits',
        headers: ['User Identity', 'Total Donated', 'Current Level', 'Next Unlock'],
        rows,
        chartData,
      });
    }

    if (!type || type === 'System Logs') {
      const staffRoles = ['OPERATIONS_STAFF', 'DELIVERY_PERSONNEL', 'COMMUNITY_ADMIN', 'PLATFORM_ADMIN'];

      const loginLogs = await prisma.loginLog.findMany({
        where: {
          user: { role: { in: staffRoles } },
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      });

      // Group by user to show summary per staff member
      const userMap = {};
      for (const log of loginLogs) {
        const uid = log.userId;
        if (!userMap[uid]) {
          userMap[uid] = {
            name: log.user.name,
            email: log.user.email,
            role: log.user.role,
            totalLogins: 0,
            totalLogouts: 0,
            lastLogin: null,
            lastLogout: null,
          };
        }
        if (log.action === 'LOGIN') {
          userMap[uid].totalLogins++;
          if (!userMap[uid].lastLogin) userMap[uid].lastLogin = log.createdAt;
        } else if (log.action === 'LOGOUT') {
          userMap[uid].totalLogouts++;
          if (!userMap[uid].lastLogout) userMap[uid].lastLogout = log.createdAt;
        }
      }

      const roleLabels = {
        OPERATIONS_STAFF: 'Operations Staff',
        DELIVERY_PERSONNEL: 'Delivery Personnel',
        COMMUNITY_ADMIN: 'Community Admin',
        PLATFORM_ADMIN: 'Platform Admin',
      };

      const rows = Object.values(userMap).map(u => ({
        col1: u.name,
        col2: roleLabels[u.role] || u.role,
        col3: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never',
        col4: u.lastLogout ? new Date(u.lastLogout).toLocaleString() : 'Still active',
      }));

      // Chart data: logins per role
      const roleCounts = {};
      for (const u of Object.values(userMap)) {
        const r = roleLabels[u.role] || u.role;
        roleCounts[r] = (roleCounts[r] || 0) + u.totalLogins;
      }
      const maxLogins = Math.max(...Object.values(roleCounts), 1);
      const colors = ['#1E4D4B', '#E9C46A', '#643C29', '#2A9D8F'];
      const chartData = Object.entries(roleCounts).map(([role, count], i) => ({
        label: role,
        val: Math.round(count / maxLogins * 100),
        color: colors[i % colors.length],
      }));

      return res.json({
        title: 'System Activity Logs',
        subtitle: 'Login and logout activity for all staff roles',
        headers: ['Staff Member', 'Role', 'Last Login', 'Last Logout'],
        rows,
        chartData,
      });
    }

    return res.status(400).json({ error: 'Invalid report type' });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
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

    // Sync level-related config into the Level database table
    const rawLevels = entries.LEVEL_THRESHOLDS ? safeJson(entries.LEVEL_THRESHOLDS) : null;
    const rawLocks = entries.MYSTERY_BOX_LOCKS ? safeJson(entries.MYSTERY_BOX_LOCKS) : null;
    const rawBoxConfigs = entries.MYSTERY_BOX_LEVEL_CONFIG ? safeJson(entries.MYSTERY_BOX_LEVEL_CONFIG) : null;

    if (rawLevels) {
      for (const lvl of rawLevels) {
        const lock = rawLocks ? rawLocks.find((l) => String(l.level) === String(lvl.level)) : null;
        const boxCfg = rawBoxConfigs ? rawBoxConfigs.find((c) => String(c.level) === String(lvl.level)) : null;
        await prisma.level.upsert({
          where: { level: Number(lvl.level) },
          update: {
            name: String(lvl.name || ''),
            minPoints: Number(lvl.minBooks || lvl.minPoints) || 0,
            reward: lvl.reward || null,
            mysteryBoxUnlock: lock ? lock.unlock : null,
            mysteryBoxPoints: boxCfg ? (Number(boxCfg.points) || null) : null,
            mysteryBoxBooks: boxCfg ? (Number(boxCfg.books) || null) : null,
          },
          create: {
            level: Number(lvl.level),
            name: String(lvl.name || ''),
            minPoints: Number(lvl.minBooks || lvl.minPoints) || 0,
            reward: lvl.reward || null,
            mysteryBoxUnlock: lock ? lock.unlock : null,
            mysteryBoxPoints: boxCfg ? (Number(boxCfg.points) || null) : null,
            mysteryBoxBooks: boxCfg ? (Number(boxCfg.books) || null) : null,
          },
        });
      }
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
