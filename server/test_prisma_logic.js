const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = 'b7ea0ce3-de94-4866-a96f-8ca26f86a7ac';
  const pointsPrice = '750';
  const title = 'how to train your dragon';
  const qty = '8';
  const imageUrl = 'https://res.cloudinary.com/ci2j6qna/image/upload/v1785264150/book-platform/profile-pics/dqzy2nkazmnkirb2wfnm.webp';

  try {
      // Get the current book to know its collectionId
      const currentBook = await prisma.bookItem.findUnique({
          where: { id },
          select: { collectionId: true }
      });

      if (!currentBook) {
          console.log('Book not found');
          return;
      }

      const quantityToUpdate = Math.max(1, parseInt(qty) || 1);

      // Find other books in the same collection that are not available
      const availableBooks = await prisma.bookItem.findMany({
          where: {
              collectionId: currentBook.collectionId,
              isAvailable: false,
              id: { not: id }
          },
          take: quantityToUpdate - 1
      });

      const idsToUpdate = [id, ...availableBooks.map(b => b.id)];
      console.log('idsToUpdate:', idsToUpdate);

      const updateData = {
          isAvailable: true,
          addedToMarketplaceAt: new Date(),
      };
      if (pointsPrice) updateData.pointsPrice = parseInt(pointsPrice);
      if (title) updateData.title = title;
      if (imageUrl) updateData.imageUrl = imageUrl;

      // Perform the updates using updateMany
      const updateResult = await prisma.bookItem.updateMany({
          where: { id: { in: idsToUpdate } },
          data: updateData
      });
      console.log('updateResult:', updateResult);

      // If the requested quantity is greater than the available books in the DB,
      // we create the remaining books!
      const remainingToCreate = quantityToUpdate - idsToUpdate.length;
      console.log('remainingToCreate:', remainingToCreate);
      if (remainingToCreate > 0) {
          // Get full details of the current book to clone them
          const fullCurrentBook = await prisma.bookItem.findUnique({
              where: { id }
          });

          const newBooksData = Array.from({ length: remainingToCreate }).map(() => ({
              title: title || fullCurrentBook.title,
              author: fullCurrentBook.author,
              isbn: fullCurrentBook.isbn,
              condition: fullCurrentBook.condition,
              language: fullCurrentBook.language,
              genre: fullCurrentBook.genre,
              publicationYear: fullCurrentBook.publicationYear,
              isDonated: fullCurrentBook.isDonated,
              donationRequestId: fullCurrentBook.donationRequestId,
              collectionId: fullCurrentBook.collectionId,
              isAvailable: true,
              pointsPrice: pointsPrice ? parseInt(pointsPrice) : fullCurrentBook.pointsPrice,
              imageUrl: imageUrl || fullCurrentBook.imageUrl,
              addedToMarketplaceAt: new Date()
          }));

          const createResult = await prisma.bookItem.createMany({
              data: newBooksData
          });
          console.log('createResult:', createResult);
      }
  } catch (error) {
      console.error('Error:', error);
  } finally {
      await prisma.$disconnect();
  }
}

main().catch(console.error);
