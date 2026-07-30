const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.bookItem.updateMany({
    where: { pointsPrice: 980 },
    data: { title: 'Load of the ring' }
  });
  console.log('Updated books:', result);
  await prisma.$disconnect();
}

main().catch(console.error);
