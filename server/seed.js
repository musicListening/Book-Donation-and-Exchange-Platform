const { prisma } = require('./db');
const bcrypt = require('bcryptjs');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ── Helpers ──
const LEVEL_NAMES = ['', 'Book Lover', 'Bibliophile', 'Grand Librarian', 'Literary Elite', 'Legendary Reader'];
const DONATION_CATEGORIES = ['Literary Fiction', 'Science & Technology', 'Biography & Memoir', 'History', 'Young Adult', 'Poetry', 'Philosophy', 'Self-Help'];
const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
const GENRES = ['Literary Fiction', 'Science & Technology', 'Biography & Memoir', 'History', 'Young Adult', 'Poetry', 'Philosophy', 'Self-Help', 'Fantasy', 'Mystery'];
const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
const SHIPPING_ADDRESSES = [
  '42 Galle Rd, Colombo', '15 Ward Pl, Colombo', '88 Kandy Rd, Colombo',
  '7 Station Rd, Colombo', '23 Marine Dr, Colombo', '56 High Level Rd, Colombo',
  '10 Temple Rd, Kandy', '85 Peradeniya Rd, Kandy', '33 Lake Dr, Kandy',
  '19 Main St, Galle', '72 Lighthouse St, Galle', '5 Hospital Rd, Galle',
  '44 Beach Rd, Negombo', '28 Church St, Negombo', '61 Sea St, Negombo',
];
const PHONES = ['+94771234567', '+94769876543', '+94775551234', '+94774443322', '+94776667788',
                '+94771112233', '+94778889900', '+94772345678', '+94773456789', '+94774567890'];

function randomDate(from, to) {
  const d = new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
  return d;
}

async function main() {
  console.log('🌱 Seeding database with comprehensive data...\n');

  // ── Step 1: Clear everything ──
  await prisma.pointTransaction.deleteMany({});
  await prisma.deliveryUpdate.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.craftListing.deleteMany({});
  await prisma.bookItem.deleteMany({});
  await prisma.donationRequest.deleteMany({});
  await prisma.bookCollection.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.eventComment.deleteMany({});
  await prisma.eventLike.deleteMany({});
  await prisma.eventPost.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.systemConfig.updateMany({ where: { updatedBy: { not: null } }, data: { updatedBy: null } });
  // Delete users created by previous seed runs (identified by @projenius.com and @example.com)
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { endsWith: '@projenius.com' } },
        { email: { endsWith: '@example.com' } },
      ],
    },
  });
  console.log('  ✓ Cleared existing seed data.\n');

  // ── Step 2: Create users ──
  const hashed = await bcrypt.hash('password123', 10);
  const users = [];

  // Admin
  users.push(await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@projenius.com', password: hashed, role: 'PLATFORM_ADMIN', points: 0, level: 5, isActive: true },
  }));
  // Staff
  users.push(await prisma.user.create({
    data: { name: 'Staff Member', email: 'staff@projenius.com', password: hashed, role: 'OPERATIONS_STAFF', points: 0, level: 1, isActive: true },
  }));
  users.push(await prisma.user.create({
    data: { name: 'Priya Sharma', email: 'priya@projenius.com', password: hashed, role: 'OPERATIONS_STAFF', points: 0, level: 1, isActive: true },
  }));
  // Delivery
  users.push(await prisma.user.create({
    data: { name: 'Delivery Driver 1', email: 'driver1@projenius.com', password: hashed, role: 'DELIVERY_PERSONNEL', points: 0, level: 1, isActive: true },
  }));
  users.push(await prisma.user.create({
    data: { name: 'Delivery Driver 2', email: 'driver2@projenius.com', password: hashed, role: 'DELIVERY_PERSONNEL', points: 0, level: 1, isActive: true },
  }));
  // Community admin
  users.push(await prisma.user.create({
    data: { name: 'Community Manager', email: 'community@projenius.com', password: hashed, role: 'COMMUNITY_ADMIN', points: 0, level: 1, isActive: true },
  }));

  // 25 end users
  const userNames = [
    'Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez', 'David Kim', 'Amasha Fernando',
    'Arjun Sharma', 'Priya Patel', 'Rajesh Kumar', 'Ananya Iyer', 'Vikram Rao',
    'Fatima Khan', 'James Wilson', 'Meera Nair', 'Carlos Mendez', 'Aisha Okafor',
    'Liam Chen', 'Sofia Torres', 'Oliver Brown', 'Zara Ali', 'Ethan Park',
    'Isabella Costa', 'Noah Williams', 'Mia Johnson', 'Lucas Garcia', 'Emma Davis',
  ];
  for (const name of userNames) {
    const email = name.toLowerCase().replace(/\s+/g, '.') + '@example.com';
    const points = rand(100, 5000);
    const level = clamp(Math.floor(points / 1000) + 1, 1, 5);
    users.push(await prisma.user.create({
      data: { name, email, password: hashed, role: 'END_USER', points, level, isActive: true },
    }));
  }
  console.log(`  ✓ Created ${users.length} users.\n`);

  // Separate collections for easy reference
  const endUsers = users.filter(u => u.role === 'END_USER');
  const staffUsers = users.filter(u => u.role === 'OPERATIONS_STAFF');
  const deliveryUsers = users.filter(u => u.role === 'DELIVERY_PERSONNEL');

  // ── Step 3: Book Collections ──
  const collectionData = [
    { title: 'Classic Literature Collection', slug: 'classic-lit', category: 'Literary Fiction', pointsRequired: 200, isRare: false, minLevelRequired: 1, cashPrice: 25.99 },
    { title: 'Science Essentials', slug: 'science-essentials', category: 'Science & Technology', pointsRequired: 180, isRare: false, minLevelRequired: 1, cashPrice: 22.50 },
    { title: 'Biography Gems', slug: 'bio-gems', category: 'Biography & Memoir', pointsRequired: 250, isRare: true, minLevelRequired: 2, cashPrice: 30.00 },
    { title: 'World History Set', slug: 'world-history', category: 'History', pointsRequired: 150, isRare: false, minLevelRequired: 1, cashPrice: 18.75 },
    { title: 'Young Adult Favorites', slug: 'ya-favorites', category: 'Young Adult', pointsRequired: 120, isRare: false, minLevelRequired: 1, cashPrice: 15.00 },
    { title: 'Poetry Anthology Bundle', slug: 'poetry-bundle', category: 'Poetry', pointsRequired: 160, isRare: false, minLevelRequired: 1, cashPrice: 20.00 },
    { title: 'Philosophy Corner', slug: 'philosophy-corner', category: 'Philosophy', pointsRequired: 220, isRare: true, minLevelRequired: 3, cashPrice: 28.00 },
    { title: 'Self-Help Collection', slug: 'self-help', category: 'Self-Help', pointsRequired: 140, isRare: false, minLevelRequired: 1, cashPrice: 17.50 },
    { title: 'Fantasy Realm Bundle', slug: 'fantasy-realm', category: 'Fantasy', pointsRequired: 300, isRare: false, minLevelRequired: 1, cashPrice: 35.00 },
    { title: 'Mystery Thriller Set', slug: 'mystery-thriller', category: 'Mystery', pointsRequired: 190, isRare: false, minLevelRequired: 1, cashPrice: 24.00 },
    { title: 'Rare First Editions', slug: 'rare-first-editions', category: 'Literary Fiction', pointsRequired: 500, isRare: true, minLevelRequired: 4, cashPrice: 60.00 },
    { title: 'Children\'s Storybook Pack', slug: 'children-stories', category: 'Young Adult', pointsRequired: 100, isRare: false, minLevelRequired: 1, cashPrice: 12.00 },
  ];
  const createdCollections = [];
  for (const c of collectionData) {
    createdCollections.push(await prisma.bookCollection.create({
      data: { ...c, type: c.isRare ? 'RARE' : 'STANDARD', stock: rand(10, 60) },
    }));
  }
  console.log(`  ✓ Created ${createdCollections.length} book collections.\n`);

  // ── Step 4: Book Titles ──
  const BOOK_TITLES = [
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
    { title: 'The Raven', author: 'Edgar Allan Poe', genre: 'Poetry' },
    { title: 'Leaves of Grass', author: 'Walt Whitman', genre: 'Poetry' },
    { title: 'Beyond Good and Evil', author: 'Friedrich Nietzsche', genre: 'Philosophy' },
    { title: 'The Art of War', author: 'Sun Tzu', genre: 'Philosophy' },
    { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help' },
    { title: 'The Power of Habit', author: 'Charles Duhigg', genre: 'Self-Help' },
    { title: 'The Fellowship of the Ring', author: 'J.R.R. Tolkien', genre: 'Fantasy' },
    { title: 'A Game of Thrones', author: 'George R.R. Martin', genre: 'Fantasy' },
    { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', genre: 'Mystery' },
    { title: 'Gone Girl', author: 'Gillian Flynn', genre: 'Mystery' },
    { title: '1984', author: 'George Orwell', genre: 'Literary Fiction' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Literary Fiction' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Literary Fiction' },
    { title: 'Dune', author: 'Frank Herbert', genre: 'Fantasy' },
    { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Self-Help' },
  ];

  // ── Step 5: Donation Requests (spread 2024-01 to 2026-07) ──
  const donations = [];
  const DONATION_COUNT = 120;
  const startRange = new Date('2026-01-01');
  const endRange = new Date('2026-07-15');

  for (let i = 0; i < DONATION_COUNT; i++) {
    const createdAt = randomDate(startRange, endRange);
    const dType = Math.random() > 0.45 ? 'SINGLE_BOOK' : 'COLLECTION';
    const reqCount = dType === 'COLLECTION' ? rand(8, 30) : rand(1, 12);
    const verifiedCount = Math.random() > 0.15 ? rand(1, reqCount) : 0; // 15% still pending
    const pointsPerBook = rand(15, 25);
    const pointsAwarded = dType === 'COLLECTION'
      ? Math.round(verifiedCount * pointsPerBook * 1.15) // 15% bonus for collections
      : verifiedCount * pointsPerBook;

    const donation = await prisma.donationRequest.create({
      data: {
        userId: pick(endUsers).id,
        type: dType,
        requestedCount: reqCount,
        verifiedCount,
        pointsAwarded,
        category: pick(DONATION_CATEGORIES),
        notes: Math.random() > 0.7 ? pick(['Express delivery', 'Fragile items', 'Contains rare books']) : null,
        dropOffDate: new Date(createdAt.getTime() + rand(1, 7) * 86400000),
        verifiedDate: verifiedCount > 0 ? new Date(createdAt.getTime() + rand(3, 14) * 86400000) : null,
        verifiedBy: verifiedCount > 0 ? pick(staffUsers).id : null,
        createdAt,
      },
    });
    donations.push(donation);
  }
  console.log(`  ✓ Created ${donations.length} donation requests (2024–2026).\n`);

  // ── Step 6: Book Items ──
  const bookItems = [];
  for (let i = 0; i < 5; i++) { // 5 passes = up to 150 books
    for (const book of BOOK_TITLES) {
      if (Math.random() > 0.45) continue; // not every title every pass
      const donation = pick(donations);
      const col = pick(createdCollections);
      const item = await prisma.bookItem.create({
        data: {
          title: book.title,
          author: book.author,
          isbn: `978${String(rand(1000000000, 9999999999))}`,
          condition: pick(CONDITIONS),
          language: 'English',
          genre: book.genre,
          isDonated: true,
          isAvailable: Math.random() > 0.25,
          donationRequestId: donation.id,
          collectionId: col.id,
          addedToMarketplaceAt: Math.random() > 0.5 ? randomDate(new Date('2025-01-01'), new Date('2026-06-30')) : null,
        },
      });
      bookItems.push(item);
    }
  }
  console.log(`  ✓ Created ${bookItems.length} book items.\n`);

  // ── Step 7: Craft Listings ──
  const craftData = [
    { title: 'Handmade Bookmark Set', description: 'Set of 5 handmade bookmarks with tassels', pointsPrice: 50 },
    { title: 'Custom Book Sleeve', description: 'Protective fabric sleeve for books up to 9" tall', pointsPrice: 120 },
    { title: 'Decorative Bookends', description: 'Hand-painted wooden bookends', pointsPrice: 200 },
    { title: 'Reading Journal', description: 'Hand-bound leather reading journal with 200 pages', pointsPrice: 180 },
    { title: 'Book Page Wreath', description: 'Decorative wreath made from vintage book pages', pointsPrice: 150 },
    { title: 'Personalized Book Stamp', description: 'Custom rubber stamp for book ownership', pointsPrice: 80 },
    { title: 'Cozy Reading Pillow', description: 'Hand-sewn reading pillow with book pocket', pointsPrice: 250 },
    { title: 'Bookish Tote Bag', description: 'Canvas tote with literary quote print', pointsPrice: 100 },
    { title: 'Handcrafted Leather Bookmark', description: 'Leather bookmark with embossed design', pointsPrice: 40 },
    { title: 'Miniature Book Necklace', description: 'Tiny book-shaped pendant on chain', pointsPrice: 65 },
    { title: 'Bookshelf Art Print', description: 'A4 art print of illustrated bookshelf', pointsPrice: 90 },
    { title: 'Poetry Card Set', description: 'Set of 8 hand-lettered poetry cards', pointsPrice: 70 },
    { title: 'Paper Flower Bouquet', description: 'Handcrafted paper flowers in a mini vase', pointsPrice: 130 },
    { title: 'Book-Themed Coasters', description: 'Set of 4 coasters with literary quotes', pointsPrice: 55 },
    { title: 'Calligraphy Wall Art', description: 'Hand-lettered quote on premium paper', pointsPrice: 110 },
    { title: 'Embroidered Book Cover', description: 'Custom embroidered fabric book cover', pointsPrice: 160 },
    { title: 'Origami Crane Mobile', description: 'Mobile of 20 hand-folded origami cranes', pointsPrice: 140 },
    { title: 'Book Page Art Journal', description: 'Art journal made from recycled book pages', pointsPrice: 85 },
    { title: 'Pressed Flower Bookmark', description: 'Real pressed flowers in resin bookmark', pointsPrice: 45 },
    { title: 'Woven Book Basket', description: 'Hand-woven basket for book storage', pointsPrice: 220 },
    { title: 'Magnetic Bookmark Set', description: 'Set of 3 magnetic bookmarks with designs', pointsPrice: 35 },
    { title: 'Bookish Candle', description: 'Soy candle with \'old book\' scent', pointsPrice: 75 },
    { title: 'Reading Nook Sign', description: 'Hand-painted wooden \'Reading Nook\' sign', pointsPrice: 95 },
    { title: 'Library Card Catalog Art', description: 'Replica vintage library card print', pointsPrice: 60 },
    { title: 'Book-Themed Jewelry Set', description: 'Necklace and earrings with book charms', pointsPrice: 150 },
  ];
  const createdCrafts = [];
  for (const c of craftData) {
    const status = Math.random() > 0.7 ? 'SOLD' : Math.random() > 0.8 ? 'ARCHIVED' : 'LISTED';
    createdCrafts.push(await prisma.craftListing.create({
      data: {
        userId: pick(endUsers).id,
        title: c.title,
        description: c.description,
        imageUrl: '/images/crafts/placeholder.jpg',
        pointsPrice: c.pointsPrice,
        status,
        views: rand(10, 2000),
        favorites: rand(0, 100),
        createdAt: randomDate(new Date('2025-06-01'), new Date('2026-07-01')),
      },
    }));
  }
  console.log(`  ✓ Created ${createdCrafts.length} craft listings.\n`);

  // ── Step 8: Orders with OrderItems ──
  const ORDERS_COUNT = 80;
  const orders = [];
  const allSoldCrafts = createdCrafts.filter(c => c.status === 'SOLD');
  for (let i = 0; i < ORDERS_COUNT; i++) {
    const user = pick(endUsers);
    const createdAt = randomDate(new Date('2024-06-01'), new Date('2026-07-10'));
    const status = pick(ORDER_STATUSES);

    // Determine items for this order
    const itemCount = rand(1, 3);
    const items = [];
    let totalPoints = 0;

    for (let j = 0; j < itemCount; j++) {
      if (Math.random() > 0.4 && createdCollections.length > 0) {
        // Add a collection item
        const col = pick(createdCollections);
        const qty = rand(1, 2);
        items.push({ collectionId: col.id, pointsAtTime: col.pointsRequired, quantity: qty, cashAtTime: col.cashPrice });
        totalPoints += col.pointsRequired * qty;
      } else if (Math.random() > 0.3 && createdCrafts.length > 0) {
        // Add a craft item
        const craft = pick(createdCrafts);
        items.push({ craftListingId: craft.id, pointsAtTime: craft.pointsPrice, quantity: 1 });
        totalPoints += craft.pointsPrice;
      } else if (bookItems.length > 0) {
        // Add a single book item
        const book = pick(bookItems);
        items.push({ bookItemId: book.id, pointsAtTime: rand(30, 80), quantity: 1 });
        totalPoints += rand(30, 80);
      }
    }

    if (items.length === 0) continue; // skip if no items

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalPoints,
        cashAmount: Math.random() > 0.7 ? parseFloat((totalPoints * 0.08).toFixed(2)) : null,
        status,
        shippingAddress: pick(SHIPPING_ADDRESSES),
        phoneNumber: pick(PHONES),
        processedAt: status !== 'PENDING' ? new Date(createdAt.getTime() + rand(1, 3) * 86400000) : null,
        deliveredAt: status === 'COMPLETED' ? new Date(createdAt.getTime() + rand(7, 21) * 86400000) : null,
        createdAt,
      },
    });

    // Create OrderItems
    for (const item of items) {
      await prisma.orderItem.create({
        data: { ...item, orderId: order.id },
      });
    }

    orders.push(order);
  }
  console.log(`  ✓ Created ${orders.length} orders with items.\n`);

  // ── Step 9: Shipments (for COMPLETED orders) ──
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  for (const order of completedOrders.slice(0, completedOrders.length - 3)) { // leave a few unshipped
    await prisma.shipment.create({
      data: {
        id: `SHP-${order.id.substring(0, 8).toUpperCase()}`,
        orderId: order.id,
        recipient: endUsers.find(u => u.id === order.userId)?.name || 'Unknown',
        location: order.shippingAddress || 'Unknown',
        items: `${rand(1, 5)} items`,
        status: 'Delivered',
        lastUpdate: new Date(order.deliveredAt || order.createdAt).toISOString(),
        driver: pick(deliveryUsers).id,
        userId: order.userId,
        createdAt: order.createdAt,
        updatedAt: order.deliveredAt || order.createdAt,
      },
    });
  }

  // Also create shipments for some PROCESSING orders (in transit)
  const processingOrders = orders.filter(o => o.status === 'PROCESSING').slice(0, 5);
  for (const order of processingOrders) {
    await prisma.shipment.create({
      data: {
        id: `SHP-${order.id.substring(0, 8).toUpperCase()}`,
        orderId: order.id,
        recipient: endUsers.find(u => u.id === order.userId)?.name || 'Unknown',
        location: order.shippingAddress || 'Unknown',
        items: `${rand(1, 5)} items`,
        status: 'In Transit',
        lastUpdate: new Date().toISOString(),
        driver: pick(deliveryUsers).id,
        userId: order.userId,
        createdAt: order.createdAt,
        updatedAt: new Date(),
      },
    });
  }

  // ── Step 10: Point Transactions (linked to actual data) ──
  const txnDescriptions = {
    EARNED_DONATION: [
      'Points earned from single book donation', 'Reward for donating books',
      'Donation points credited after verification',
    ],
    EARNED_BONUS: [
      'Collection donation bonus (15% extra)', 'Bonus points for bulk donation',
      'Special collection bonus credited',
    ],
    SPENT_BOOK: [
      'Redeemed points for book collection', 'Book bundle purchase',
      'Points spent on book marketplace order',
    ],
    SPENT_CRAFT: [
      'Redeemed points for handmade craft', 'Craft marketplace purchase',
      'Points spent on artisanal craft item',
    ],
    STAFF_ADJUSTMENT: [
      'Staff adjustment for quality donation', 'Bonus adjustment by admin',
      'Corrective points adjustment',
    ],
    EARNED_SALE: [
      'Points from craft sale proceeds', 'Earned from listing sale',
    ],
  };

  // Transaction 1a: For each donation, create EARNED_DONATION transaction
  let txnCount = 0;
  for (const donation of donations) {
    if (donation.pointsAwarded <= 0) continue;
    const baseAmount = Math.round(donation.pointsAwarded * 0.85); // 85% is base donation
    const bonusAmount = donation.pointsAwarded - baseAmount;

    // Main donation earning
    await prisma.pointTransaction.create({
      data: {
        userId: donation.userId,
        type: 'EARNED_DONATION',
        amount: baseAmount,
        description: pick(txnDescriptions.EARNED_DONATION),
        relatedDonationId: donation.id,
        createdAt: donation.verifiedDate || donation.createdAt,
      },
    });
    txnCount++;

    // Bonus for collections
    if (donation.type === 'COLLECTION' && bonusAmount > 0) {
      await prisma.pointTransaction.create({
        data: {
          userId: donation.userId,
          type: 'EARNED_BONUS',
          amount: bonusAmount,
          description: pick(txnDescriptions.EARNED_BONUS),
          relatedDonationId: donation.id,
          createdAt: donation.verifiedDate || donation.createdAt,
        },
      });
      txnCount++;
    }
  }

  // Transaction 1b: For each order, create SPENT transactions
  for (const order of orders) {
    const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    for (const item of orderItems) {
      if (item.collectionId || item.bookItemId) {
        await prisma.pointTransaction.create({
          data: {
            userId: order.userId,
            type: 'SPENT_BOOK',
            amount: item.pointsAtTime * item.quantity,
            description: pick(txnDescriptions.SPENT_BOOK),
            relatedOrderId: order.id,
            createdAt: order.createdAt,
          },
        });
        txnCount++;
      }
      if (item.craftListingId) {
        await prisma.pointTransaction.create({
          data: {
            userId: order.userId,
            type: 'SPENT_CRAFT',
            amount: item.pointsAtTime * item.quantity,
            description: pick(txnDescriptions.SPENT_CRAFT),
            relatedOrderId: order.id,
            createdAt: order.createdAt,
          },
        });
        txnCount++;
      }
    }
  }

  // Transaction 1c: Some random STAFF_ADJUSTMENT transactions
  for (let i = 0; i < 30; i++) {
    const user = pick(endUsers);
    const isPositive = Math.random() > 0.4;
    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        type: 'STAFF_ADJUSTMENT',
        amount: isPositive ? rand(10, 200) : rand(10, 100) * -1,
        description: pick(txnDescriptions.STAFF_ADJUSTMENT),
        staffId: pick(staffUsers).id,
        createdAt: randomDate(new Date('2025-01-01'), new Date('2026-07-01')),
      },
    });
    txnCount++;
  }

  console.log(`  ✓ Created ${txnCount} point transactions (linked to donations & orders).\n`);

  // ── Step 11: Update user points to reflect actual transactions ──
  for (const user of endUsers) {
    const earned = await prisma.pointTransaction.aggregate({
      where: { userId: user.id, type: { in: ['EARNED_DONATION', 'EARNED_BONUS', 'EARNED_SALE', 'STAFF_ADJUSTMENT'] }, amount: { gt: 0 } },
      _sum: { amount: true },
    });
    const spent = await prisma.pointTransaction.aggregate({
      where: { userId: user.id, type: { in: ['SPENT_BOOK', 'SPENT_CRAFT'] } },
      _sum: { amount: true },
    });
    const earnedNeg = await prisma.pointTransaction.aggregate({
      where: { userId: user.id, type: 'STAFF_ADJUSTMENT', amount: { lt: 0 } },
      _sum: { amount: true },
    });
    const totalEarned = (earned._sum?.amount || 0) + (earnedNeg._sum?.amount || 0);
    const totalSpent = spent._sum?.amount || 0;
    const balance = Math.max(0, totalEarned - totalSpent);
    const level = clamp(Math.floor(balance / 800) + 1, 1, 5);

    await prisma.user.update({
      where: { id: user.id },
      data: { points: balance, level },
    });
  }
  console.log('  ✓ Updated user points/levels based on real transactions.\n');

  // ── Step 12: Level table (database-backed) ──
  const levels = [
    { level: 1, minPoints: 10,  name: 'Book Lover',       reward: 'Basic Mystery Box (3 Books)',          mysteryBoxUnlock: 'Standard Mystery Box',      mysteryBoxPoints: 100, mysteryBoxBooks: 3 },
    { level: 2, minPoints: 25,  name: 'Bibliophile',       reward: 'Rare Collection Unlock (Victorian Set)', mysteryBoxUnlock: null,                       mysteryBoxPoints: null, mysteryBoxBooks: null },
    { level: 3, minPoints: 50,  name: 'Grand Librarian',   reward: 'Premium Mystery Box + 5% Discount',    mysteryBoxUnlock: 'Premium Mystery Box',       mysteryBoxPoints: 200, mysteryBoxBooks: 5 },
    { level: 4, minPoints: 75,  name: 'Literary Elite',    reward: 'Exclusive Editions + Direct Support',  mysteryBoxUnlock: 'Rare Collection Access',    mysteryBoxPoints: 350, mysteryBoxBooks: 7 },
    { level: 5, minPoints: 100, name: 'Legendary Reader',  reward: 'All Mystery Boxes Free + Rare Unlocks', mysteryBoxUnlock: 'All Mystery Boxes Free',    mysteryBoxPoints: 0,   mysteryBoxBooks: 10 },
  ];
  for (const lvl of levels) {
    await prisma.level.upsert({
      where: { level: lvl.level },
      update: lvl,
      create: lvl,
    });
  }

  // ── Step 13: System Configuration ──
  const defaultConfigs = [
    { key: 'BASE_POINTS_PER_BOOK', value: '10', description: 'Minimum points awarded for a single verified book donation' },
    { key: 'COLLECTION_BONUS_PERCENTAGE', value: '10', description: 'Extra percentage added when a verified collection is donated' },
    { key: 'POINT_TO_CASH_CONVERSION_RATE', value: '100:10', description: 'Conversion metric (e.g., 100 points = 10 Rs)' },
    { key: 'LEVEL_THRESHOLDS', value: JSON.stringify([
      { level: 1, minBooks: 10, name: 'Book Lover', reward: 'Basic Mystery Box (3 Books)' },
      { level: 2, minBooks: 25, name: 'Bibliophile', reward: 'Rare Collection Unlock (Victorian Set)' },
      { level: 3, minBooks: 50, name: 'Grand Librarian', reward: 'Premium Mystery Box + 5% Discount' },
      { level: 4, minBooks: 75, name: 'Literary Elite', reward: 'Exclusive Editions + Direct Support' },
      { level: 5, minBooks: 100, name: 'Legendary Reader', reward: 'All Mystery Boxes Free + Rare Unlocks' },
    ]), description: 'JSON array of level thresholds with minBooks (books donated), name, and reward' },
    { key: 'MYSTERY_BOX_BOOKS', value: '5' },
    { key: 'MYSTERY_BOX_POINTS_COST', value: '200' },
    { key: 'RARE_COLLECTION_MIN_LEVEL', value: '2' },
    { key: 'MYSTERY_BOX_LOCKS', value: JSON.stringify([
      { level: 1, unlock: 'Standard Mystery Box' },
      { level: 3, unlock: 'Premium Mystery Box' },
      { level: 4, unlock: 'Rare Collection Access' },
      { level: 5, unlock: 'All Mystery Boxes Free' },
    ]) },
    { key: 'GLOBAL_NOTIFICATION_TEMPLATES', value: JSON.stringify({
      levelUp: 'Congratulations! You\'ve reached {levelName}!',
      pointsEarned: 'You earned {points} points for your donation.',
      mysteryBoxUnlocked: 'You\'ve unlocked a {boxName}! Redeem it now.',
      orderUpdate: 'Your order #{orderId} is now {status}.',
    }) },
  ];
  for (const cfg of defaultConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value, description: cfg.description },
      create: cfg,
    });
  }

  // ── Final summary ──
  console.log('\n═══════════════════════════════════════');
  console.log('  🌱 SEED COMPLETE — SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`  Users:              ${await prisma.user.count()}`);
  console.log(`  Levels:             ${await prisma.level.count()}`);
  console.log(`  Book Collections:   ${await prisma.bookCollection.count()}`);
  console.log(`  Donation Requests:  ${await prisma.donationRequest.count()}`);
  console.log(`  Book Items:         ${await prisma.bookItem.count()}`);
  console.log(`  Craft Listings:     ${await prisma.craftListing.count()}`);
  console.log(`  Orders:             ${await prisma.order.count()}`);
  console.log(`  Order Items:        ${await prisma.orderItem.count()}`);
  console.log(`  Shipments:          ${await prisma.shipment.count()}`);
  console.log(`  Point Transactions: ${await prisma.pointTransaction.count()}`);
  console.log('═══════════════════════════════════════\n');
  console.log('  🔑 Test accounts (password: password123):');
  console.log('     Admin:  admin@projenius.com');
  console.log('     Staff:  staff@projenius.com');
  console.log('     User:   sarah.jenkins@example.com');
  console.log('     Driver: driver1@projenius.com');
  console.log('     Community: community@projenius.com\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
