const express = require('express');
const { prisma } = require('../db');
const { calculateLevelByBooks } = require('../utils/pointsCalculator');
const router = express.Router();

// Helper to fetch SystemConfig map
async function getSystemConfigs(keys) {
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: keys } }
  });
  const map = {};
  for (const c of configs) {
    map[c.key] = c.value;
  }
  return map;
}

// Helper to clean up any duplicate or unearned unclaimed mystery boxes for the user
async function cleanupDuplicateBoxes(userId) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const booksDonated = user.booksDonated || 0;
    const actualLevel = await calculateLevelByBooks(booksDonated);

    // Sync user level in database if needed
    if (user.level !== actualLevel) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: actualLevel }
      }).catch(() => {});
    }

    const boxes = await prisma.mysteryBox.findMany({
      where: { userId, status: 'UNCLAIMED' },
      orderBy: { createdAt: 'asc' }
    });

    const seenLevels = new Set();
    const toDelete = [];

    for (const box of boxes) {
      // Skip staff-awarded boxes (do not delete them even if duplicate level)
      if (box.assignedBy) continue;

      // If user hasn't earned this level box (e.g. box.level > actualLevel for level > 0), delete it
      if (box.level > 0 && box.level > actualLevel) {
        toDelete.push(box.id);
      } else if (seenLevels.has(box.level)) {
        toDelete.push(box.id);
      } else {
        seenLevels.add(box.level);
      }
    }

    if (toDelete.length > 0) {
      await prisma.bookItem.updateMany({
        where: { mysteryBoxId: { in: toDelete } },
        data: { mysteryBoxId: null, isAvailable: true }
      });

      await prisma.mysteryBox.deleteMany({
        where: { id: { in: toDelete } }
      });
    }
  } catch (err) {
    console.error('Error cleaning up duplicate mystery boxes:', err);
  }
}

// GET all mystery boxes for a user (automatically deduplicates and cleans unearned boxes first)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await cleanupDuplicateBoxes(userId);

    const boxes = await prisma.mysteryBox.findMany({
      where: { userId },
      include: { books: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(boxes);
  } catch (error) {
    console.error('Error fetching mystery boxes:', error);
    res.status(500).json({ error: error.message });
  }
});

// AUTO-ASSIGN: Assigns Default Mystery Box (available to any user) and level-based mystery boxes earned
router.post('/auto-assign', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Deduplicate any existing duplicate or unearned unclaimed boxes
    await cleanupDuplicateBoxes(userId);

    const existingBoxes = await prisma.mysteryBox.findMany({
      where: { userId }
    });
    const existingLevels = new Set(existingBoxes.map(b => b.level));

    const configs = await getSystemConfigs(['MYSTERY_BOX_BOOKS', 'MYSTERY_BOX_POINTS_COST']);
    const defaultBookCount = parseInt(configs.MYSTERY_BOX_BOOKS) || 5;

    const assigned = [];

    // 1. AUTO-ASSIGN DEFAULT MYSTERY BOX (level = 0) if user doesn't have one yet
    if (!existingLevels.has(0)) {
      const alreadyHas = await prisma.mysteryBox.findFirst({
        where: { userId: user.id, level: 0 }
      });

      if (!alreadyHas) {
        const availableBooks = await prisma.bookItem.findMany({
          where: { isAvailable: true, mysteryBoxId: null }
        });

        const shuffled = [...availableBooks].sort(() => 0.5 - Math.random());
        let selectedBooks = shuffled.slice(0, Math.min(defaultBookCount, shuffled.length));

        if (selectedBooks.length < defaultBookCount) {
          const placeholderTitles = [
            'The Great Gatsby', 'To Kill a Mockingbird', '1984',
            'Pride and Prejudice', 'The Hobbit', 'Brave New World',
            'The Catcher in the Rye', 'Of Mice and Men'
          ];
          for (let i = selectedBooks.length; i < defaultBookCount; i++) {
            const title = placeholderTitles[i % placeholderTitles.length];
            const placeholderBook = await prisma.bookItem.create({
              data: {
                title,
                author: 'Various Authors',
                genre: 'Classic Literature',
                isAvailable: false,
                updatedAt: new Date()
              }
            });
            selectedBooks.push(placeholderBook);
          }
        }

        const defaultBox = await prisma.mysteryBox.create({
          data: {
            userId: user.id,
            level: 0,
            status: 'UNCLAIMED',
            description: `Default Mystery Box — ${selectedBooks.length} random books inside`,
            updatedAt: new Date()
          }
        });

        for (const book of selectedBooks) {
          await prisma.bookItem.update({
            where: { id: book.id },
            data: { mysteryBoxId: defaultBox.id, isAvailable: false }
          });
        }

        assigned.push(defaultBox);
        existingLevels.add(0);
      }
    }

    // 2. AUTO-ASSIGN LEVEL-BASED MYSTERY BOXES (only if user calculated level > 0)
    const booksDonated = user.booksDonated || 0;
    const userLevel = await calculateLevelByBooks(booksDonated);

    let eligibleLevels = [];
    if (userLevel > 0) {
      eligibleLevels = await prisma.level.findMany({
        where: {
          level: { lte: userLevel },
          NOT: { mysteryBoxUnlock: null }
        }
      });
    }

    const missingLevels = eligibleLevels.filter(l => !existingLevels.has(l.level));

    for (const levelConfig of missingLevels) {
      // Double check atomically before creating each level box
      const alreadyHasLevelBox = await prisma.mysteryBox.findFirst({
        where: { userId: user.id, level: levelConfig.level }
      });

      if (alreadyHasLevelBox) continue;

      const boxBookCount = levelConfig.mysteryBoxBooks || defaultBookCount;
      const unlockName = levelConfig.mysteryBoxUnlock || 'Level Mystery Box';

      const availableBooks = await prisma.bookItem.findMany({
        where: { isAvailable: true, mysteryBoxId: null }
      });

      const shuffled = [...availableBooks].sort(() => 0.5 - Math.random());
      let selectedBooks = shuffled.slice(0, Math.min(boxBookCount, shuffled.length));

      if (selectedBooks.length < boxBookCount) {
        const placeholderTitles = [
          'The Great Gatsby', 'To Kill a Mockingbird', '1984',
          'Pride and Prejudice', 'The Hobbit', 'Brave New World',
          'The Catcher in the Rye', 'Of Mice and Men'
        ];
        for (let i = selectedBooks.length; i < boxBookCount; i++) {
          const title = placeholderTitles[i % placeholderTitles.length];
          const placeholderBook = await prisma.bookItem.create({
            data: {
              title,
              author: 'Various Authors',
              genre: 'Classic Literature',
              isAvailable: false,
              updatedAt: new Date()
            }
          });
          selectedBooks.push(placeholderBook);
        }
      }

      const mysteryBox = await prisma.mysteryBox.create({
        data: {
          userId: user.id,
          level: levelConfig.level,
          status: 'UNCLAIMED',
          description: `${unlockName} — ${selectedBooks.length} books inside`,
          updatedAt: new Date()
        }
      });

      for (const book of selectedBooks) {
        await prisma.bookItem.update({
          where: { id: book.id },
          data: { mysteryBoxId: mysteryBox.id, isAvailable: false }
        });
      }

      assigned.push(mysteryBox);
      existingLevels.add(levelConfig.level);
    }

    res.json({ assigned: assigned.length, boxes: assigned });
  } catch (error) {
    console.error('Error auto-assigning mystery boxes:', error);
    res.status(500).json({ error: error.message });
  }
});

// CLAIM a mystery box (deducts points)
router.post('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const mysteryBox = await prisma.mysteryBox.findUnique({ where: { id } });
    if (!mysteryBox) return res.status(404).json({ error: 'Mystery box not found' });
    if (mysteryBox.status === 'CLAIMED') return res.status(400).json({ error: 'Already claimed' });

    const user = await prisma.user.findUnique({ where: { id: mysteryBox.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let pointsCost = 0;
    let boxTitle = 'Mystery Box';

    if (mysteryBox.level === 0) {
      const configs = await getSystemConfigs(['MYSTERY_BOX_POINTS_COST']);
      pointsCost = parseInt(configs.MYSTERY_BOX_POINTS_COST) || 200;
      boxTitle = 'Default Mystery Box';
    } else {
      const levelConfig = await prisma.level.findUnique({ where: { level: mysteryBox.level } });
      pointsCost = levelConfig?.mysteryBoxPoints !== null && levelConfig?.mysteryBoxPoints !== undefined
        ? levelConfig.mysteryBoxPoints
        : 0;
      boxTitle = levelConfig?.mysteryBoxUnlock || `Level ${mysteryBox.level} Mystery Box`;
    }

    if (pointsCost > 0 && (user.points || 0) < pointsCost) {
      return res.status(400).json({ error: `Not enough points. You need ${pointsCost} points to claim this mystery box.` });
    }

    const updatedBox = await prisma.mysteryBox.update({
      where: { id: id },
      data: { status: 'CLAIMED', claimedAt: new Date() },
      include: { books: true }
    });

    res.json(updatedBox);

    if (pointsCost > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { points: (user.points || 0) - pointsCost }
      });

      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          type: 'SPENT_BOOK',
          amount: -pointsCost,
          description: `Claimed ${boxTitle}${mysteryBox.level > 0 ? ` (Level ${mysteryBox.level})` : ''}`,
          staffId: null
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error claiming mystery box:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
