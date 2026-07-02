const prisma = require('./db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding database with abundant data...');

  // Clear existing donation/craft/order data to reseed
  await prisma.pointTransaction.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.craftListing.deleteMany({});
  await prisma.bookItem.deleteMany({});
  await prisma.donationRequest.deleteMany({});
  await prisma.bookCollection.deleteMany({});
  console.log('Cleared existing seed data.');

  // ── Book Collections ──
  const collections = [
    { title: 'Classic Literature Collection', slug: 'classic-lit', category: 'Literary Fiction', type: 'STANDARD', stock: 45, pointsRequired: 200, isRare: false, minLevelRequired: 1, cashPrice: 25.99 },
    { title: 'Science Essentials', slug: 'science-essentials', category: 'Science & Technology', type: 'STANDARD', stock: 38, pointsRequired: 180, isRare: false, minLevelRequired: 1, cashPrice: 22.50 },
    { title: 'Biography Gems', slug: 'bio-gems', category: 'Biography & Memoir', type: 'STANDARD', stock: 22, pointsRequired: 250, isRare: true, minLevelRequired: 2, cashPrice: 30.00 },
    { title: 'World History Set', slug: 'world-history', category: 'History', type: 'STANDARD', stock: 30, pointsRequired: 150, isRare: false, minLevelRequired: 1, cashPrice: 18.75 },
    { title: 'Young Adult Favorites', slug: 'ya-favorites', category: 'Young Adult', type: 'STANDARD', stock: 55, pointsRequired: 120, isRare: false, minLevelRequired: 1, cashPrice: 15.00 },
  ];
  const createdCollections = [];
  for (const c of collections) {
    createdCollections.push(await prisma.bookCollection.create({ data: c }));
  }

  // ── Donor users ──
  const donorUsers = await prisma.user.findMany({ where: { points: { gt: 0 } } });
  if (donorUsers.length < 5) {
    // Create some donor users if not enough exist
    for (let i = 0; i < 5; i++) {
      const u = await prisma.user.create({
        data: {
          name: `Donor User ${i + 1}`,
          email: `donor${i + 1}@example.com`,
          password: await bcrypt.hash('password123', 10),
          role: 'END_USER',
          points: Math.floor(Math.random() * 2000) + 500,
          level: Math.floor(Math.random() * 5) + 1,
          isActive: true,
        }
      });
      donorUsers.push(u);
    }
  }

  // ── Historical Donations (spread over 7 months) ──
  const months = [5, 4, 3, 2, 1, 0]; // last 6 months + current
  const donationTemplates = [
    { type: 'COLLECTION', requestedCount: 15, verifiedCount: 15, pointsAwarded: 300 },
    { type: 'SINGLE_BOOK', requestedCount: 8, verifiedCount: 7, pointsAwarded: 140 },
    { type: 'COLLECTION', requestedCount: 28, verifiedCount: 28, pointsAwarded: 560 },
    { type: 'SINGLE_BOOK', requestedCount: 5, verifiedCount: 5, pointsAwarded: 100 },
    { type: 'COLLECTION', requestedCount: 12, verifiedCount: 11, pointsAwarded: 220 },
    { type: 'SINGLE_BOOK', requestedCount: 3, verifiedCount: 3, pointsAwarded: 60 },
  ];

  const categories = ['Literary Fiction', 'Science & Technology', 'Biography & Memoir', 'History', 'Young Adult'];
  const donations = [];

  for (let monthOffset of months) {
    const numDonations = 3 + Math.floor(Math.random() * 3); // 3-5 per month
    for (let i = 0; i < numDonations; i++) {
      const tmpl = donationTemplates[Math.floor(Math.random() * donationTemplates.length)];
      const day = Math.floor(Math.random() * 25) + 1;
      const createdAt = new Date(2026, 5 - monthOffset, day, 10 + Math.floor(Math.random() * 10), 0, 0);

      const donation = await prisma.donationRequest.create({
        data: {
          userId: donorUsers[i % donorUsers.length].id,
          type: tmpl.type,
          requestedCount: tmpl.requestedCount + Math.floor(Math.random() * 5),
          verifiedCount: tmpl.verifiedCount + Math.floor(Math.random() * 2),
          pointsAwarded: tmpl.pointsAwarded + Math.floor(Math.random() * 50),
          category: categories[Math.floor(Math.random() * categories.length)],
          notes: 'Historical donation',
          dropOffDate: new Date(createdAt.getTime() + 86400000),
          verifiedDate: new Date(createdAt.getTime() + 2 * 86400000),
          createdAt,
        }
      });
      donations.push(donation);
    }
  }
  console.log(`Created ${donations.length} donation requests across 7 months.`);

  // ── Historical donations from previous years (for yearly chart) ──
  for (const year of [2024, 2025]) {
    const numDonations = 4 + Math.floor(Math.random() * 3); // 4-6 per year
    for (let i = 0; i < numDonations; i++) {
      const tmpl = donationTemplates[Math.floor(Math.random() * donationTemplates.length)];
      const month = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 25) + 1;
      const createdAt = new Date(year, month, day, 10 + Math.floor(Math.random() * 10), 0, 0);
      const donation = await prisma.donationRequest.create({
        data: {
          userId: donorUsers[i % donorUsers.length].id,
          type: tmpl.type,
          requestedCount: tmpl.requestedCount + Math.floor(Math.random() * 5),
          verifiedCount: tmpl.verifiedCount + Math.floor(Math.random() * 2),
          pointsAwarded: tmpl.pointsAwarded + Math.floor(Math.random() * 50),
          category: categories[Math.floor(Math.random() * categories.length)],
          notes: 'Historical donation',
          dropOffDate: new Date(createdAt.getTime() + 86400000),
          verifiedDate: new Date(createdAt.getTime() + 2 * 86400000),
          createdAt,
        }
      });
      donations.push(donation);
    }
  }
  console.log(`Created historical donations for 2024 and 2025.`);

  // ── Book Items ──
  const bookTitles = [
    { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Literary Fiction' },
    { title: 'Great Expectations', author: 'Charles Dickens', genre: 'Literary Fiction' },
    { title: 'Wuthering Heights', author: 'Emily Bronte', genre: 'Literary Fiction' },
    { title: 'Jane Eyre', author: 'Charlotte Bronte', genre: 'Literary Fiction' },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Science & Technology' },
    { title: 'The Selfish Gene', author: 'Richard Dawkins', genre: 'Science & Technology' },
    { title: 'Cosmos', author: 'Carl Sagan', genre: 'Science & Technology' },
    { title: 'Steve Jobs', author: 'Walter Isaacson', genre: 'Biography & Memoir' },
    { title: 'The Diary of a Young Girl', author: 'Anne Frank', genre: 'Biography & Memoir' },
    { title: 'Long Walk to Freedom', author: 'Nelson Mandela', genre: 'Biography & Memoir' },
    { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'History' },
    { title: 'The Guns of August', author: 'Barbara Tuchman', genre: 'History' },
    { title: 'The Hunger Games', author: 'Suzanne Collins', genre: 'Young Adult' },
    { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', genre: 'Young Adult' },
    { title: 'The Fault in Our Stars', author: 'John Green', genre: 'Young Adult' },
  ];

  for (let i = 0; i < 3; i++) { // 3 batches = 45 books
    for (const book of bookTitles) {
      const donation = donations[Math.floor(Math.random() * donations.length)];
      const col = createdCollections[Math.floor(Math.random() * createdCollections.length)];
      await prisma.bookItem.create({
        data: {
          title: book.title,
          author: book.author,
          isbn: `978${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
          condition: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'][Math.floor(Math.random() * 4)],
          language: 'English',
          genre: book.genre,
          isDonated: true,
          isAvailable: Math.random() > 0.3,
          donationRequestId: donation.id,
          collectionId: col.id,
          addedToMarketplaceAt: Math.random() > 0.5 ? new Date() : null,
        }
      });
    }
  }
  const totalBooks = await prisma.bookItem.count();
  console.log(`Created ${totalBooks} book items.`);

  // ── Craft Listings ──
  const craftUsers = await prisma.user.findMany({ take: 8 });
  const crafts = [
    { title: 'Handmade Bookmark Set', description: 'Set of 5 handmade bookmarks with tassels', pointsPrice: 50, status: 'LISTED' },
    { title: 'Custom Book Sleeve', description: 'Protective fabric sleeve for books up to 9" tall', pointsPrice: 120, status: 'LISTED' },
    { title: 'Decorative Bookends', description: 'Hand-painted wooden bookends', pointsPrice: 200, status: 'LISTED' },
    { title: 'Reading Journal', description: 'Hand-bound leather reading journal with 200 pages', pointsPrice: 180, status: 'LISTED' },
    { title: 'Book Page Wreath', description: 'Decorative wreath made from vintage book pages', pointsPrice: 150, status: 'LISTED' },
    { title: 'Personalized Book Stamp', description: 'Custom rubber stamp for book ownership', pointsPrice: 80, status: 'LISTED' },
    { title: 'Cozy Reading Pillow', description: 'Hand-sewn reading pillow with book pocket', pointsPrice: 250, status: 'LISTED' },
    { title: 'Bookish Tote Bag', description: 'Canvas tote with literary quote print', pointsPrice: 100, status: 'LISTED' },
    { title: 'Handcrafted Bookmark', description: 'Leather bookmark with embossed design', pointsPrice: 40, status: 'LISTED' },
    { title: 'Miniature Book Necklace', description: 'Tiny book-shaped pendant on chain', pointsPrice: 65, status: 'LISTED' },
    { title: 'Bookshelf Art Print', description: 'A4 art print of illustrated bookshelf', pointsPrice: 90, status: 'SOLD' },
    { title: 'Poetry Card Set', description: 'Set of 8 hand-lettered poetry cards', pointsPrice: 70, status: 'LISTED' },
  ];

  for (const c of crafts) {
    const user = craftUsers[Math.floor(Math.random() * craftUsers.length)];
    await prisma.craftListing.create({
      data: {
        userId: user.id,
        title: c.title,
        description: c.description,
        imageUrl: '/images/crafts/placeholder.jpg',
        pointsPrice: c.pointsPrice,
        status: c.status,
        views: Math.floor(Math.random() * 500),
        favorites: Math.floor(Math.random() * 50),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      }
    });
  }
  const totalCrafts = await prisma.craftListing.count();
  console.log(`Created ${totalCrafts} craft listings.`);

  // ── Orders (more) ──
  const orderUsers = await prisma.user.findMany({ where: { role: 'END_USER' }, take: 8 });
  const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
  for (let i = 0; i < 20; i++) {
    const user = orderUsers[i % orderUsers.length];
    await prisma.order.create({
      data: {
        userId: user.id,
        totalPoints: Math.floor(Math.random() * 500) + 50,
        cashAmount: Math.random() > 0.6 ? Math.floor(Math.random() * 80) + 10 : null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        shippingAddress: `${Math.floor(Math.random() * 200) + 1} Main St, Colombo, Sri Lanka`,
        phoneNumber: `+9477${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      }
    });
  }
  const totalOrders = await prisma.order.count();
  console.log(`Created ${totalOrders} orders.`);

  // ── Point Transactions ──
  const txnUsers = await prisma.user.findMany({ take: 10 });
  for (let i = 0; i < 40; i++) {
    const user = txnUsers[i % txnUsers.length];
    const type = ['EARNED_DONATION', 'EARNED_SALE', 'EARNED_BONUS', 'SPENT_BOOK', 'SPENT_CRAFT', 'STAFF_ADJUSTMENT'][Math.floor(Math.random() * 6)];
    const isPositive = ['EARNED_DONATION', 'EARNED_SALE', 'EARNED_BONUS'].includes(type);
    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        type,
        amount: Math.floor(Math.random() * 500) + 20,
        description: isPositive ? 'Points earned from activity' : 'Points spent on rewards',
        staffId: 'usr_001',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      }
    });
  }
  const totalTxns = await prisma.pointTransaction.count();
  console.log(`Created ${totalTxns} point transactions.`);

  // ── System Configuration Defaults ──
  const defaultConfigs = [
    { key: 'BASE_POINTS_PER_BOOK', value: '10', description: 'Minimum points awarded for a single verified book donation' },
    { key: 'COLLECTION_BONUS_PERCENTAGE', value: '10', description: 'Extra percentage added when a verified collection is donated' },
    { key: 'POINT_TO_CASH_CONVERSION_RATE', value: '100:10', description: 'Conversion metric (e.g., 100 points = 10 Rs)' },
    { key: 'LEVEL_THRESHOLDS', value: JSON.stringify([
      { level: 1, minPoints: 0, name: 'Book Lover', reward: 'Basic Mystery Box (3 Books)' },
      { level: 2, minPoints: 250, name: 'Bibliophile', reward: 'Rare Collection Unlock (Victorian Set)' },
      { level: 3, minPoints: 750, name: 'Grand Librarian', reward: 'Premium Mystery Box + 5% Discount' },
      { level: 4, minPoints: 2000, name: 'Literary Elite', reward: 'Exclusive Editions + Direct Support' },
      { level: 5, minPoints: 5000, name: 'Legendary Reader', reward: 'All Mystery Boxes Free + Rare Unlocks' },
    ]), description: 'JSON array of level thresholds with minPoints, name, and reward' },
    { key: 'MYSTERY_BOX_BOOKS', value: '5', description: 'Number of random books in a standard mystery box' },
    { key: 'MYSTERY_BOX_POINTS_COST', value: '200', description: 'Points required to redeem a mystery box' },
    { key: 'RARE_COLLECTION_MIN_LEVEL', value: '2', description: 'Minimum level required to browse rare collections' },
    { key: 'MYSTERY_BOX_LOCKS', value: JSON.stringify([
      { level: 1, unlock: 'Standard Mystery Box' },
      { level: 3, unlock: 'Premium Mystery Box' },
      { level: 4, unlock: 'Rare Collection Access' },
      { level: 5, unlock: 'All Mystery Boxes Free' },
    ]), description: 'JSON array mapping levels to mystery box/rare unlocks' },
    { key: 'GLOBAL_NOTIFICATION_TEMPLATES', value: JSON.stringify({
      levelUp: 'Congratulations! You\'ve reached {levelName}!',
      pointsEarned: 'You earned {points} points for your donation.',
      mysteryBoxUnlocked: 'You\'ve unlocked a {boxName}! Redeem it now.',
      orderUpdate: 'Your order #{orderId} is now {status}.',
    }), description: 'JSON object of notification message templates' },
  ];

  for (const cfg of defaultConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value, description: cfg.description },
      create: cfg,
    });
  }
  console.log(`Seeded ${defaultConfigs.length} system configuration entries.`);

  console.log('\nSeed complete! Database is now abundant with data.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
