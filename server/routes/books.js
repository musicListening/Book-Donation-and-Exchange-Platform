// server/routes/books.js
const express = require('express');
const { prisma } = require('../db');
const { uploadBook, uploadToCloudinary } = require('../config/cloudinary');
const router = express.Router();

// ===== CREATE Book Item =====
router.post('/', async (req, res) => {
    try {
        const { title, author, isbn, condition, genre, publicationYear } = req.body;

        const book = await prisma.bookItem.create({
            data: {
                title,
                author,
                isbn,
                condition: condition || 'GOOD',
                genre,
                publicationYear: publicationYear ? parseInt(publicationYear) : null,
                isAvailable: true,
            }
        });

        res.status(201).json(book);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== READ ALL Books =====
router.get('/', async (req, res) => {
    try {
        const books = await prisma.bookItem.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== GET Marketplace Books =====
router.get('/marketplace', async (req, res) => {
    try {
        const { genre, condition, minPrice, maxPrice, search } = req.query;

        const where = {
            isAvailable: true,
            addedToMarketplaceAt: { not: null },
            mysteryBoxId: null,
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

        // Group books by title, condition, and pointsPrice into a single card with quantity
        const groupedMap = new Map();

        for (const book of books) {
            const cleanTitle = (book.title || '').replace(/\s*#\d+$/i, '').trim();
            const key = `${cleanTitle.toLowerCase()}_${(book.condition || '').toLowerCase()}_${book.pointsPrice || 0}`;
            
            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    id: book.id,
                    bookIds: [book.id],
                    title: cleanTitle,
                    author: book.author,
                    genre: book.genre,
                    condition: book.condition,
                    pointsPrice: book.pointsPrice,
                    imageUrl: book.imageUrl,
                    donorImages: book.donationRequest?.donationImages || [],
                    collection: book.collection,
                    addedAt: book.addedToMarketplaceAt,
                    quantity: 1,
                });
            } else {
                const existing = groupedMap.get(key);
                existing.quantity += 1;
                existing.bookIds.push(book.id);
                if (!existing.imageUrl && book.imageUrl) existing.imageUrl = book.imageUrl;
                if (book.donationRequest?.donationImages?.length && !existing.donorImages?.length) {
                    existing.donorImages = book.donationRequest.donationImages;
                }
            }
        }

        const marketplaceItems = Array.from(groupedMap.values());
        res.json(marketplaceItems);
    } catch (error) {
        console.error('Marketplace fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch marketplace' });
    }
});

// ===== GET Books in Collection =====
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

// ===== UPDATE Book =====
router.put('/:id', uploadBook.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, condition, genre, publicationYear,
                collectionId, pointsPrice, isAvailable } = req.body;

        let imageUrl = req.body.imageUrl || undefined;

        if (req.file) {
            const result = await uploadToCloudinary(req.file);
            imageUrl = result.secure_url;
        }

        const book = await prisma.bookItem.update({
            where: { id },
            data: {
                title, author, isbn, condition, genre,
                publicationYear: publicationYear ? parseInt(publicationYear) : undefined,
                collectionId: collectionId || undefined,
                pointsPrice: pointsPrice ? parseInt(pointsPrice) : undefined,
                isAvailable: isAvailable === 'true' || isAvailable === true ? true : (isAvailable === 'false' || isAvailable === false ? false : undefined),
                imageUrl,
                addedToMarketplaceAt: (isAvailable === 'true' || isAvailable === true) ? new Date() : undefined,
            },
            include: { collection: true, donationRequest: true },
        });

        res.json(book);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== Upload/Replace Book Image =====
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

// ===== Add Book to Marketplace =====
router.put('/:id/add-to-marketplace', uploadBook.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { pointsPrice, title, qty, existingImageUrl } = req.body;
        
        let imageUrl = existingImageUrl || undefined;
        if (req.file) {
            const result = await uploadToCloudinary(req.file);
            imageUrl = result.secure_url;
        }

        // Get the current book to know its collectionId
        const currentBook = await prisma.bookItem.findUnique({
            where: { id },
            select: { collectionId: true }
        });

        if (!currentBook) {
            return res.status(404).json({ error: 'Book not found' });
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

        const updateData = {
            isAvailable: true,
            addedToMarketplaceAt: new Date(),
        };
        if (pointsPrice) updateData.pointsPrice = parseInt(pointsPrice);
        if (title) updateData.title = title;
        if (imageUrl) updateData.imageUrl = imageUrl;

        // Perform the updates using updateMany
        await prisma.bookItem.updateMany({
            where: { id: { in: idsToUpdate } },
            data: updateData
        });

        // If the requested quantity is greater than the available books in the DB,
        // we create the remaining books!
        const remainingToCreate = quantityToUpdate - idsToUpdate.length;
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

            await prisma.bookItem.createMany({
                data: newBooksData
            });
        }

        // Get one of the updated books to return
        const book = await prisma.bookItem.findUnique({
            where: { id },
            include: { collection: true }
        });

        res.json(book);
    } catch (error) {
        console.error('Error adding book to marketplace:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== Remove Book from Marketplace =====
router.put('/:id/remove-from-marketplace', async (req, res) => {
    try {
        const { id } = req.params;
        const book = await prisma.bookItem.update({
            where: { id },
            data: {
                isAvailable: false,
                addedToMarketplaceAt: null,
            },
            include: { collection: true },
        });
        res.json(book);
    } catch (error) {
        console.error('Error removing book from marketplace:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== DELETE Book =====
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        try {
            await prisma.bookItem.delete({ where: { id } });
        } catch (e) {
            console.warn('Hard delete book failed, applying soft delete:', e.message);
            await prisma.bookItem.update({
                where: { id },
                data: { isAvailable: false, addedToMarketplaceAt: null }
            });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;