const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.bookItem.findMany();
  books.forEach(b => {
    if (b.pointsPrice === 980 || b.title.includes('ring') || b.pointsPrice === 1000) {
      console.log('Book in DB:', b);
    }
  });
  await prisma.$disconnect();
}
main().catch(console.error);
