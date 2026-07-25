const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'user@test.com' } });
  if (!user) return console.log('User not found');
  const boxes = await prisma.mysteryBox.findMany({ where: { userId: user.id } });
  console.log(JSON.stringify(boxes, null, 2));
}

main().finally(() => prisma.$disconnect());
