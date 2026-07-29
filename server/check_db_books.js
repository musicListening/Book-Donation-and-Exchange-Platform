const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.bookItem.findMany({
    where: { collectionId: 'b104400b-1920-42fa-96cc-50b8e7423e7c' }
  });
  console.log('Books in collection:', books.map(b => ({
    id: b.id,
    title: b.title,
    isAvailable: b.isAvailable,
    pointsPrice: b.pointsPrice
  })));
  await prisma.$disconnect();
}
main().catch(console.error);
