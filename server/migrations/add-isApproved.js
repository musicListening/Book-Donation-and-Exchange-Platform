const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`ALTER TABLE "PlatformReview" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false`;
  console.log('Column isApproved added to PlatformReview table.');
  
  // Approve all existing reviews so the homepage isn't broken
  const updated = await prisma.$executeRaw`UPDATE "PlatformReview" SET "isApproved" = true WHERE "isApproved" = false`;
  console.log(`Approved ${updated} existing review(s).`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
