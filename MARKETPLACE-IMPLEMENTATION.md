# Marketplace Implementation Plan

## Overview

Build a complete marketplace where donated books and user-submitted crafts are listed for purchase with points. The flow connects donation verification → bundle management → marketplace display.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Current State & Gaps](#2-current-state--gaps)
3. [Schema Changes](#3-schema-changes)
4. [Cloudinary Setup](#4-cloudinary-setup)
5. [Backend Routes](#5-backend-routes)
6. [Frontend: Donation Verification UI](#6-frontend-donation-verification-ui)
7. [Frontend: Bundle Management Updates](#7-frontend-bundle-management-updates)
8. [Frontend: Marketplace Page](#8-frontend-marketplace-page)
9. [Frontend: Craft Listing Flow](#9-frontend-craft-listing-flow)
10. [Route Registration](#10-route-registration)
11. [Testing Checklist](#11-testing-checklist)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER FLOW                            │
│                                                         │
│  Donate Books + Photos ──► Staff Verifies ──► Books     │
│                                    │            │       │
│                                    ▼            ▼       │
│                            Select Bundle    Marketplace │
│                            (dropdown)       (with images│
│                                    │            │       │
│                                    ▼            ▼       │
│                         Bundle Management   Users Buy   │
│                         (real book count)   with Points │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    CRAFT FLOW                           │
│                                                         │
│  User Submits Craft + Photos ──► Staff Approves ──►     │
│                                        │                │
│                                        ▼                │
│                                   Marketplace          │
│                                   (Crafts Tab)         │
└─────────────────────────────────────────────────────────┘
```

### Data Relationships

```
DonationRequest (1) ──── (many) BookItem
                                │
BookCollection (1) ──── (many) BookItem  ← collectionId FK
                                │
BookItem (1) ──── (many) CartItem
BookItem (1) ──── (many) OrderItem

User (1) ──── (many) CraftListing
CraftListing (1) ──── (many) CartItem
CraftListing (1) ──── (many) OrderItem
```

---

## 2. Current State & Gaps

### What Exists

| Component | Status | Location |
|-----------|--------|----------|
| BookCollection (Bundle) CRUD | Working | `server/routes/collections.js`, `client/src/pages/staff/BundleManagement.jsx` |
| Donation creation | Working (images broken) | `server/routes/donations.js`, `client/src/pages/user/donate.jsx` |
| Donation verification (points) | Working | `server/routes/donations.js` PATCH `/verify` |
| Cloudinary config | Working (profile pics only) | `server/config/cloudinary.js` |
| CraftListing schema | Exists | `server/prisma/schema.prisma` lines 140-157 |
| Craft seed data | Exists | `server/seed.js` lines 232-277 |

### What's Broken / Missing

| Gap | Impact | Fix Required |
|-----|--------|-------------|
| Donation images sent but backend ignores them | Donor photos lost | Add multer to donation POST route |
| No BookItem creation on verification | Verified books never enter system | Auto-create BookItems in verify endpoint |
| `BookItem` has no `imageUrl` field | Can't store book images | Add field to schema |
| `BookItem` has no `pointsPrice` field | Can't price books | Add field to schema |
| `DonationRequest` has no image storage | Donor photos not saved | Add `donationImages String[]` |
| No book-to-collection assignment API | Can't link books to bundles | Add assignment endpoint |
| `stock` on BookCollection is manual number | Doesn't reflect real count | Make it count from BookItem records |
| No marketplace API endpoint | Frontend uses localStorage | Create marketplace route |
| No craft approval flow | Crafts can't be submitted/approved | Create crafts routes + UI |
| Marketplace renders emojis not images | No real photos shown | Rebuild with `<img>` tags |

---

## 3. Schema Changes

### File: `server/prisma/schema.prisma`

#### 3.1 Add `imageUrl` and `pointsPrice` to BookItem

```prisma
model BookItem {
  id                   String           @id @default(uuid())
  title                String
  author               String?
  isbn                 String?
  condition            BookCondition    @default(GOOD)
  language             String           @default("English")
  genre                String?
  publicationYear      Int?
  imageUrl             String?          // ADD: Staff-uploaded marketplace image
  pointsPrice          Int?             // ADD: Price in points (auto-calculated or staff-set)
  isDonated            Boolean          @default(false)
  donationRequestId    String?
  collectionId         String?
  isAvailable          Boolean          @default(true)
  addedToMarketplaceAt DateTime?
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  mysteryBoxId         String?
  collection           BookCollection?  @relation(fields: [collectionId], references: [id])
  donationRequest      DonationRequest? @relation(fields: [donationRequestId], references: [id])
  MysteryBox           MysteryBox?      @relation(...)
  CartItem             CartItem[]
  orderItems           OrderItem[]
}
```

#### 3.2 Add `donationImages` to DonationRequest

```prisma
model DonationRequest {
  id                   String           @id @default(uuid())
  userId               String
  type                 DonationType     @default(SINGLE_BOOK)
  requestedCount       Int
  verifiedCount        Int              @default(0)
  dropOffDate          DateTime?
  verifiedDate         DateTime?
  verifiedBy           String?
  pointsAwarded        Int              @default(0)
  notes                String?
  staffNotes           String?
  collectionName       String?
  category             String?
  donationImages       String[]         // ADD: Array of Cloudinary URLs from donor
  awardedMysteryBox    Boolean          @default(false)
  condition            String?
  isCollectionComplete Boolean          @default(false)
  status               String           @default("PENDING")
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  books                BookItem[]
  user                 User             @relation(fields: [userId], references: [id])
  Notification         Notification[]
  PointTransaction     PointTransaction[]
}
```

#### 3.3 Run Migration

```bash
npx prisma migrate dev --name add-marketplace-fields
```

---

## 4. Cloudinary Setup

### File: `server/config/cloudinary.js`

Add two new multer middleware and a multi-file upload function alongside existing `uploadProfile`.

#### 4.1 Add `uploadDonation` (multi-file for donor photos)

```javascript
const uploadDonation = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  },
});
```

#### 4.2 Add `uploadBook` (single file for staff book images)

```javascript
const uploadBook = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  },
});
```

#### 4.3 Add `uploadToCloudinaryMultiple(files)` function

```javascript
function uploadToCloudinaryMultiple(files) {
  return Promise.all(
    files.map((file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'book-platform/donation-images',
            format: 'webp',
            transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      })
    )
  );
}
```

#### 4.4 Exports

```javascript
module.exports = {
  cloudinary,
  uploadProfile,
  uploadBook,
  uploadDonation,
  uploadToCloudinary,
  uploadToCloudinaryMultiple,
};
```

---

## 5. Backend Routes

### 5.1 Fix Donation Routes

**File:** `server/routes/donations.js`

#### POST `/api/donations` — Add image upload

```javascript
const { uploadDonation, uploadToCloudinaryMultiple } = require('../config/cloudinary');

router.post('/', uploadDonation.array('images', 10), async (req, res) => {
  try {
    const { userId, type, collectionName, category, requestedCount, notes, dropOffDate } = req.body;

    // Upload donor images to Cloudinary
    let donationImages = [];
    if (req.files && req.files.length > 0) {
      donationImages = await uploadToCloudinaryMultiple(req.files);
    }

    const donation = await prisma.donationRequest.create({
      data: {
        userId,
        type,
        collectionName,
        category,
        requestedCount: parseInt(requestedCount),
        notes,
        dropOffDate: dropOffDate ? new Date(dropOffDate) : null,
        donationImages, // Save Cloudinary URLs
      },
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});
```

#### PATCH `/api/donations/:id/verify` — Auto-create BookItems

Add this logic **after** points are awarded and **before** mystery box check:

```javascript
// After points are awarded (around line 252 in current file):

// Create BookItem records for verified books
const { verifiedCount, condition, bundleId } = req.body; // bundleId = collectionId to assign to
const bookItems = [];

for (let i = 0; i < verifiedCount; i++) {
  const bookItem = await prisma.bookItem.create({
    data: {
      title: `${donation.category || 'Donated Book'} #${i + 1}`,
      condition: condition || 'GOOD',
      isDonated: true,
      donationRequestId: donation.id,
      collectionId: bundleId || null, // Assign to selected bundle
      isAvailable: false, // Not available until staff enables
    },
  });
  bookItems.push(bookItem);
}

// Include bookItems in the response
res.json({
  donation: updatedDonation,
  bookItems,
  points: calculatedPoints,
  // ... existing response fields
});
```

---

### 5.2 Update Books Routes

**File:** `server/routes/books.js`

#### PUT `/api/books/:id` — Add image + collection + marketplace fields

```javascript
const { uploadBook, uploadToCloudinary } = require('../config/cloudinary');

router.put('/:id', uploadBook.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, condition, genre, publicationYear,
            collectionId, pointsPrice, isAvailable } = req.body;

    let imageUrl = req.body.imageUrl || undefined;

    // Upload new image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      imageUrl = result.secure_url;
    }

    const book = await prisma.bookItem.update({
      where: { id },
      data: {
        title, author, isbn, condition, genre,
        publicationYear: publicationYear ? parseInt(publicationYear) : undefined,
        collectionId: collectionId || null,
        pointsPrice: pointsPrice ? parseInt(pointsPrice) : undefined,
        isAvailable: isAvailable === 'true' || isAvailable === true,
        imageUrl,
        addedToMarketplaceAt: isAvailable === true ? new Date() : undefined,
      },
      include: { collection: true, donationRequest: true },
    });

    res.json(book);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});
```

#### PUT `/api/books/:id/image` — Staff upload/replace book image

```javascript
router.put('/:id/image', uploadBook.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const result = await uploadToCloudinary(req.file);

    const book = await prisma.bookItem.update({
      where: { id },
      data: { imageUrl: result.secure_url },
      select: { id: true, title: true, imageUrl: true },
    });

    res.json(book);
  } catch (error) {
    console.error('Upload book image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});
```

#### GET `/api/books/marketplace` — Return available books

```javascript
router.get('/marketplace', async (req, res) => {
  try {
    const { genre, condition, minPrice, maxPrice, search } = req.query;

    const where = {
      isAvailable: true,
      addedToMarketplaceAt: { not: null },
      mysteryBoxId: null, // Exclude mystery box books
    };

    if (genre) where.genre = genre;
    if (condition) where.condition = condition;
    if (minPrice || maxPrice) {
      where.pointsPrice = {};
      if (minPrice) where.pointsPrice.gte = parseInt(minPrice);
      if (maxPrice) where.pointsPrice.lte = parseInt(maxPrice);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const books = await prisma.bookItem.findMany({
      where,
      include: {
        collection: { select: { id: true, title: true, category: true } },
        donationRequest: {
          select: { id: true, donationImages: true },
        },
      },
      orderBy: { addedToMarketplaceAt: 'desc' },
    });

    // Map response to include donor images
    const marketplaceItems = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      condition: book.condition,
      pointsPrice: book.pointsPrice,
      imageUrl: book.imageUrl,
      donorImages: book.donationRequest?.donationImages || [],
      collection: book.collection,
      addedAt: book.addedToMarketplaceAt,
    }));

    res.json(marketplaceItems);
  } catch (error) {
    console.error('Marketplace fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace' });
  }
});
```

#### GET `/api/books/collection/:collectionId` — Books in a bundle

```javascript
router.get('/collection/:collectionId', async (req, res) => {
  try {
    const books = await prisma.bookItem.findMany({
      where: { collectionId: req.params.collectionId },
      include: {
        donationRequest: { select: { id: true, userId: true, donationImages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(books);
  } catch (error) {
    console.error('Fetch collection books error:', error);
    res.status(500).json({ error: 'Failed to fetch collection books' });
  }
});
```

---

### 5.3 New Craft Routes

**File:** `server/routes/crafts.js` (new file)

```javascript
const express = require('express');
const router = express.Router();
const { prisma } = require('../config/db');
const { uploadBook, uploadToCloudinary } = require('../config/cloudinary');

// GET /api/crafts — List crafts (filterable by status)
router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const crafts = await prisma.craftListing.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(crafts);
  } catch (error) {
    console.error('Fetch crafts error:', error);
    res.status(500).json({ error: 'Failed to fetch crafts' });
  }
});

// POST /api/crafts — User submits craft listing
router.post('/', uploadBook.single('image'), async (req, res) => {
  try {
    const { userId, title, description, pointsPrice } = req.body;

    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      imageUrl = result.secure_url;
    }

    const craft = await prisma.craftListing.create({
      data: {
        userId,
        title,
        description,
        pointsPrice: parseInt(pointsPrice),
        imageUrl,
        status: 'DRAFT', // Awaiting staff approval
      },
    });

    res.status(201).json(craft);
  } catch (error) {
    console.error('Create craft error:', error);
    res.status(500).json({ error: 'Failed to create craft listing' });
  }
});

// PATCH /api/crafts/:id/approve — Staff approves craft
router.patch('/:id/approve', async (req, res) => {
  try {
    const craft = await prisma.craftListing.update({
      where: { id: req.params.id },
      data: { status: 'LISTED' },
    });
    res.json(craft);
  } catch (error) {
    console.error('Approve craft error:', error);
    res.status(500).json({ error: 'Failed to approve craft' });
  }
});

// PATCH /api/crafts/:id/reject — Staff rejects craft
router.patch('/:id/reject', async (req, res) => {
  try {
    const craft = await prisma.craftListing.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });
    res.json(craft);
  } catch (error) {
    console.error('Reject craft error:', error);
    res.status(500).json({ error: 'Failed to reject craft' });
  }
});

// PUT /api/crafts/:id/image — Update craft image
router.put('/:id/image', uploadBook.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const result = await uploadToCloudinary(req.file);

    const craft = await prisma.craftListing.update({
      where: { id: req.params.id },
      data: { imageUrl: result.secure_url },
      select: { id: true, title: true, imageUrl: true },
    });

    res.json(craft);
  } catch (error) {
    console.error('Update craft image error:', error);
    res.status(500).json({ error: 'Failed to update craft image' });
  }
});

module.exports = router;
```

---

## 6. Frontend: Donation Verification UI

### File: `client/src/pages/staff/DonationSchedule.jsx`

#### 6.1 Show Donor Photos in Verification Modal

Add a new section in the modal (around line 573, after the donation summary):

```jsx
{/* Donor Uploaded Images */}
{donation.donationImages && donation.donationImages.length > 0 && (
  <div style={{ marginTop: 16 }}>
    <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
      Donor Photos ({donation.donationImages.length})
    </h4>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {donation.donationImages.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`Donation photo ${i + 1}`}
          style={{
            width: 100, height: 100, objectFit: 'cover',
            borderRadius: 8, border: '1px solid #DEE2E6',
            cursor: 'pointer',
          }}
          onClick={() => window.open(url, '_blank')} // Open full size
        />
      ))}
    </div>
  </div>
)}
```

#### 6.2 Add Bundle Dropdown to Verification Form

Add after the "Book Condition" dropdown (around line 617):

```jsx
{/* Bundle Assignment */}
<div style={{ marginBottom: 16 }}>
  <label style={labelStyle}>Assign to Bundle</label>
  <select
    value={selectedBundleId}
    onChange={(e) => setSelectedBundleId(e.target.value)}
    style={inputStyle}
  >
    <option value="">— No Bundle (Marketplace Only) —</option>
    {bundles.map((bundle) => (
      <option key={bundle.id} value={bundle.id}>
        {bundle.name} ({bundle.items} items)
      </option>
    ))}
  </select>
</div>
```

#### 6.3 Add "Add to Marketplace" Checkbox

```jsx
<div style={{ marginBottom: 16 }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
    <input
      type="checkbox"
      checked={addToMarketplace}
      onChange={(e) => setAddToMarketplace(e.target.checked)}
    />
    <span style={{ fontSize: 14, fontWeight: 600 }}>Add to Marketplace</span>
  </label>
</div>
```

#### 6.4 Update Verify Handler

Pass bundle and marketplace data to the API:

```javascript
const handleVerify = async () => {
  // ... existing validation ...

  const response = await fetch(`/api/donations/${donation.id}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verifiedCount: actualBooksReceived,
      condition: selectedCondition,
      bundleId: selectedBundleId || null,
      addToMarketplace,
    }),
  });

  // ... handle response ...
};
```

#### 6.5 Fetch Bundles on Modal Open

```javascript
const [bundles, setBundles] = useState([]);

const openVerifyModal = async (donation) => {
  // ... existing logic ...
  const res = await fetch('/api/collections');
  const data = await res.json();
  setBundles(data);
};
```

---

## 7. Frontend: Bundle Management Updates

### File: `client/src/pages/staff/BundleManagement.jsx`

#### 7.1 Show Real Book Count

Replace the manual `items` field with a real count from the API:

```javascript
const [bundleBooks, setBundleBooks] = useState({});

const loadAllData = async () => {
  // ... existing fetch for collections ...

  // Fetch book counts for each collection
  const bookCounts = {};
  for (const col of collections) {
    const res = await fetch(`/api/books/collection/${col.id}`);
    const books = await res.json();
    bookCounts[col.id] = {
      count: books.length,
      books: books,
    };
  }
  setBundleBooks(bookCounts);
};
```

#### 7.2 Display Real Count in Table

```jsx
<td>{bundleBooks[bundle.id]?.count || 0}</td>  {/* Instead of bundle.items */}
```

#### 7.3 Add "View Books" Button per Bundle

```jsx
<button
  onClick={() => openBundleBooks(bundle.id)}
  style={styles.viewBtn}
>
  View Books ({bundleBooks[bundle.id]?.count || 0})
</button>
```

#### 7.4 Bundle Books Modal

Show all books in a selected bundle with their images and marketplace status:

```jsx
{showBooksModal && (
  <div className="modal-overlay">
    <div className="modal-content" style={{ maxWidth: 800 }}>
      <h3>Books in {selectedBundle.name}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {bundleBooks[selectedBundle.id]?.books.map((book) => (
          <div key={book.id} style={bookCardStyle}>
            {book.imageUrl ? (
              <img src={book.imageUrl} alt={book.title} style={bookImageStyle} />
            ) : (
              <div style={placeholderStyle}>{book.title[0]}</div>
            )}
            <p style={{ fontWeight: 600, fontSize: 14 }}>{book.title}</p>
            <p style={{ fontSize: 12, color: '#6C757D' }}>{book.condition}</p>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: book.isAvailable ? '#E8F5E9' : '#FFF3E0',
              color: book.isAvailable ? '#2E7D32' : '#E65100',
            }}>
              {book.isAvailable ? 'Marketplace' : 'Inventory'}
            </span>
          </div>
        ))}
      </div>
      <button onClick={() => setShowBooksModal(false)}>Close</button>
    </div>
  </div>
)}
```

---

## 8. Frontend: Marketplace Page

### File: `client/src/pages/user/marketplace.jsx`

#### 8.1 Fetch from API Instead of localStorage

Replace the localStorage reads (lines 18-19):

```javascript
// OLD:
const bundles = JSON.parse(localStorage.getItem('ss_bundles') || '[]');
const crafts = JSON.parse(localStorage.getItem('ss_crafts') || '[]');

// NEW:
const [books, setBooks] = useState([]);
const [crafts, setCrafts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchMarketplace = async () => {
    try {
      const [booksRes, craftsRes] = await Promise.all([
        fetch('/api/books/marketplace'),
        fetch('/api/crafts?status=LISTED'),
      ]);
      setBooks(await booksRes.json());
      setCrafts(await craftsRes.json());
    } catch (err) {
      console.error('Failed to load marketplace:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchMarketplace();
}, []);
```

#### 8.2 Replace Emoji Rendering with Real Images

Replace the emoji `<div>` (line 130-131):

```jsx
// OLD:
<div style={styles.imagePlaceholder}>
  <span style={{ fontSize: 64 }}>{item.image}</span>
</div>

// NEW:
<div style={styles.imageContainer}>
  {item.imageUrl ? (
    <img
      src={item.imageUrl}
      alt={item.title}
      style={styles.bookImage}
    />
  ) : (
    <div style={styles.imagePlaceholder}>
      <span style={{ fontSize: 48 }}>{item.genre?.[0] || 'B'}</span>
    </div>
  )}
</div>
```

#### 8.3 Add Donor Photo Gallery (Expandable)

When a book has donor images, show them in an expandable section:

```jsx
{item.donorImages && item.donorImages.length > 0 && (
  <div style={{ marginTop: 8 }}>
    <button
      onClick={() => toggleDonorImages(item.id)}
      style={{ fontSize: 11, color: '#006D5B', background: 'none', border: 'none', cursor: 'pointer' }}
    >
      View donor photos ({item.donorImages.length})
    </button>
    {expandedDonorImages[item.id] && (
      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
        {item.donorImages.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Donor photo ${i + 1}`}
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
            onClick={() => window.open(url, '_blank')}
          />
        ))}
      </div>
    )}
  </div>
)}
```

#### 8.4 Show Points Price from Backend

Replace hardcoded `item.price`:

```jsx
// OLD:
<span style={styles.points}>{item.price} pts</span>

// NEW:
<span style={styles.points}>{item.pointsPrice || 0} pts</span>
```

#### 8.5 Add Condition Badge

```jsx
<span style={{
  fontSize: 10, padding: '2px 6px', borderRadius: 4,
  background: conditionColors[item.condition] || '#F1F3F5',
  color: conditionTextColors[item.condition] || '#495057',
}}>
  {item.condition}
</span>
```

#### 8.6 Loading State

```jsx
if (loading) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Loading marketplace...</p>
    </div>
  );
}
```

---

## 9. Frontend: Craft Listing Flow

### 9.1 User Craft Submission Page

**File:** `client/src/pages/user/SubmitCraft.jsx` (new file)

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubmitCraft() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pointsPrice, setPointsPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !pointsPrice) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('pointsPrice', pointsPrice);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/crafts', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to submit');

      setMessage({ type: 'success', text: 'Craft submitted! Awaiting staff approval.' });
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
      <h2>Submit a Craft Listing</h2>
      <p style={{ color: '#6C757D', marginBottom: 24 }}>
        Share your handcrafted items with the community.
      </p>

      {message && (
        <div style={{
          padding: 12, borderRadius: 8, marginBottom: 16,
          background: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
          color: message.type === 'success' ? '#2E7D32' : '#C62828',
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            style={inputStyle} placeholder="e.g. Hand-painted bookmark" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4} style={inputStyle} placeholder="Describe your craft..." />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Points Price</label>
          <input type="number" value={pointsPrice} onChange={(e) => setPointsPrice(e.target.value)}
            style={inputStyle} placeholder="e.g. 50" min="1" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Photo</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {previewUrl && (
            <img src={previewUrl} alt="Preview"
              style={{ marginTop: 8, width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }} />
          )}
        </div>

        <button type="submit" disabled={submitting}
          style={{
            padding: '12px 24px', background: '#006D5B', color: 'white',
            border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
          }}>
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #DEE2E6', fontSize: 14,
};
```

### 9.2 Staff Craft Approval Page

**File:** `client/src/pages/staff/CraftApproval.jsx` (new file)

```jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

export default function CraftApproval() {
  const [crafts, setCrafts] = useState([]);
  const [filter, setFilter] = useState('DRAFT'); // DRAFT = pending approval

  useEffect(() => {
    fetchCrafts();
  }, [filter]);

  const fetchCrafts = async () => {
    try {
      const res = await fetch(`/api/crafts?status=${filter}`);
      setCrafts(await res.json());
    } catch (err) {
      console.error('Failed to fetch crafts:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await fetch(`/api/crafts/${id}/approve`, { method: 'PATCH' });
      fetchCrafts(); // Refresh list
    } catch (err) {
      alert('Failed to approve craft');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this craft listing?')) return;
    try {
      await fetch(`/api/crafts/${id}/reject`, { method: 'PATCH' });
      fetchCrafts();
    } catch (err) {
      alert('Failed to reject craft');
    }
  };

  return (
    <StaffLayout>
      <div style={{ padding: 32 }}>
        <h2>Craft Approval</h2>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['DRAFT', 'LISTED', 'ARCHIVED'].map((status) => (
            <button key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', fontWeight: 600,
                background: filter === status ? '#006D5B' : '#F1F3F5',
                color: filter === status ? 'white' : '#495057',
                cursor: 'pointer',
              }}>
              {status}
            </button>
          ))}
        </div>

        {/* Craft Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {crafts.map((craft) => (
            <div key={craft.id} style={cardStyle}>
              {craft.imageUrl ? (
                <img src={craft.imageUrl} alt={craft.title} style={imageStyle} />
              ) : (
                <div style={{ ...imageStyle, background: '#F1F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Image
                </div>
              )}
              <div style={{ padding: 16 }}>
                <h4 style={{ margin: 0 }}>{craft.title}</h4>
                <p style={{ fontSize: 13, color: '#6C757D', margin: '4px 0' }}>
                  by {craft.user?.name || 'Unknown'}
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#006D5B' }}>
                  {craft.pointsPrice} pts
                </p>
                <p style={{ fontSize: 12, color: '#6C757D' }}>{craft.description?.slice(0, 100)}...</p>

                {craft.status === 'DRAFT' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => handleApprove(craft.id)} style={approveBtn}>Approve</button>
                    <button onClick={() => handleReject(craft.id)} style={rejectBtn}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}

const cardStyle = { background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' };
const imageStyle = { width: '100%', height: 200, objectFit: 'cover' };
const approveBtn = { padding: '8px 16px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' };
const rejectBtn = { padding: '8px 16px', background: '#C62828', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' };
```

---

## 10. Route Registration

### 10.1 Server — `server/index.js`

Add crafts route:

```javascript
const craftRoutes = require('./routes/crafts');

// In the route registration section:
app.use('/api/crafts', craftRoutes);
```

### 10.2 Client — `client/src/App.jsx`

Add new routes:

```jsx
import SubmitCraft from './pages/user/SubmitCraft';
import CraftApproval from './pages/staff/CraftApproval';

// In Routes:
<Route path="/submit-craft" element={<ProtectedRoute><SubmitCraft /></ProtectedRoute>} />
<Route path="/staff/craft-approval" element={<ProtectedRoute requiredRole="OPERATIONS_STAFF"><CraftApproval /></ProtectedRoute>} />
```

### 10.3 Staff Layout — Add Craft Approval Nav Item

In `client/src/components/StaffLayout.jsx`, add to the `menuItems` array:

```javascript
{ path: '/staff/craft-approval', label: 'Craft Approval', icon: 'check_circle' },
```

---

## 11. Testing Checklist

### Donation Flow
- [ ] User donates books with photos → images saved to Cloudinary
- [ ] Donation appears in staff verification queue with photos visible
- [ ] Staff verifies → BookItems auto-created
- [ ] Staff selects bundle → books linked to collection
- [ ] Staff adds to marketplace → books appear on marketplace page

### Bundle Management
- [ ] Bundle shows real book count (not manual number)
- [ ] Click "View Books" → see all books in bundle with images
- [ ] Books show correct condition and marketplace status

### Marketplace
- [ ] Fetches books from API (not localStorage)
- [ ] Shows real images with fallback for no-image books
- [ ] Donor photos expandable in gallery
- [ ] Points price displayed correctly
- [ ] Condition badge shown

### Crafts
- [ ] User submits craft → status DRAFT
- [ ] Staff sees pending crafts → can approve/reject
- [ ] Approved crafts appear on marketplace
- [ ] Craft images upload to Cloudinary

### Edge Cases
- [ ] Donation with no images → still works (images optional)
- [ ] Book with no image → shows gradient placeholder
- [ ] Book with no price → shows "Free" or hides price
- [ ] Large image upload → handled by 10MB limit
- [ ] Non-image file upload → rejected with error message

---

## Summary of All Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `server/routes/crafts.js` | Craft CRUD + approval routes |
| `client/src/pages/user/SubmitCraft.jsx` | User craft submission form |
| `client/src/pages/staff/CraftApproval.jsx` | Staff craft approval page |

### Modified Files
| File | Changes |
|------|---------|
| `server/prisma/schema.prisma` | Add `imageUrl`, `pointsPrice` to BookItem; add `donationImages` to DonationRequest |
| `server/config/cloudinary.js` | Add `uploadDonation`, `uploadBook`, `uploadToCloudinaryMultiple` |
| `server/routes/donations.js` | Add multer to POST; auto-create BookItems in PATCH verify |
| `server/routes/books.js` | Add image upload, collection assignment, marketplace endpoint |
| `server/index.js` | Register crafts route |
| `client/src/pages/staff/DonationSchedule.jsx` | Show donor photos, bundle dropdown, marketplace checkbox |
| `client/src/pages/staff/BundleManagement.jsx` | Real book count, view books modal |
| `client/src/pages/user/marketplace.jsx` | Fetch from API, real images, donor gallery |
| `client/src/App.jsx` | Add craft routes |
| `client/src/components/StaffLayout.jsx` | Add craft approval nav item |
