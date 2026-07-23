const { prisma } = require('../db');

async function getSystemConfig(keys) {
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: keys } }
  });
  const map = {};
  for (const c of configs) {
    map[c.key] = c.value;
  }
  return map;
}

async function calculateDonationPoints(bookCount, isCollection) {
  const config = await getSystemConfig(['BASE_POINTS_PER_BOOK', 'COLLECTION_BONUS_PERCENTAGE']);
  const baseRate = parseInt(config.BASE_POINTS_PER_BOOK) || 10;
  const bonusPct = parseInt(config.COLLECTION_BONUS_PERCENTAGE) || 10;

  const basePoints = bookCount * baseRate;
  const bonus = isCollection ? Math.round(basePoints * (bonusPct / 100)) : 0;
  return { basePoints, bonus, total: basePoints + bonus, baseRate, bonusPct };
}

async function calculateLevelByBooks(booksDonated) {
  const count = Number(booksDonated) || 0;
  if (count < 10) return 0;

  const levels = await prisma.level.findMany({ orderBy: { level: 'asc' } });
  if (levels.length === 0) {
    if (count >= 100) return 5;
    if (count >= 75) return 4;
    if (count >= 50) return 3;
    if (count >= 25) return 2;
    if (count >= 10) return 1;
    return 0;
  }
  let currentLevel = 0;
  for (const lvl of levels) {
    const minRequired = lvl.minPoints !== undefined && lvl.minPoints !== null ? lvl.minPoints : 0;
    if (count >= minRequired && count >= 10) {
      currentLevel = lvl.level;
    }
  }
  return currentLevel;
}

module.exports = { getSystemConfig, calculateDonationPoints, calculateLevelByBooks };
