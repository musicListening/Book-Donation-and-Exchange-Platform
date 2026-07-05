const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Retry wrapper for transient Neon cold-start failures
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      if (err.code === 'P1001' || err.code === 'P1002') {
        console.warn(`DB connection failed (attempt ${attempt}/${maxRetries}), retrying...`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw err;
    }
  }
}

// Warm up database connection (handles Neon cold starts)
async function warmUpDb() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log('💾 Neon Database connected successfully!');
      return;
    } catch (err) {
      if (attempt === 3) {
        console.error('❌ Database connection failed:', err.message);
        return;
      }
      console.warn(`DB warm-up attempt ${attempt}/3 failed, retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

module.exports = { prisma, withRetry, warmUpDb };