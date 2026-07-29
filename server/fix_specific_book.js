const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.bookItem.update({
    where: { id: '8d8b6842-cf74-4098-adb1-497d60fd28f5' },
    data: { title: 'how to train your dragon' }
  });
  console.log('Updated book:', result);
  await prisma.$disconnect();
}

main().catch(console.error);
