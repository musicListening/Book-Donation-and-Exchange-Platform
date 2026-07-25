const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const boxes = await prisma.mysteryBox.findMany();
  console.log(JSON.stringify(boxes.map(b => ({
    id: b.id,
    level: b.level,
    status: b.status,
    assignedBy: b.assignedBy,
    userId: b.userId,
  })), null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
