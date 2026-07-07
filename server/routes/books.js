// server/routes/books.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// ===== CREATE Book Item =====
router.post('/', async (req, res) => {
    try {
        const { title, author, isbn, condition, genre, publicationYear, userId } = req.body;

        const book = await prisma.bookItem.create({
            data: {
                title,
                author,
                isbn,
                condition: condition || 'GOOD',
                genre,
                publicationYear: publicationYear ? parseInt(publicationYear) : null,
                isAvailable: true,
                userId,
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

// ===== UPDATE Book =====
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, condition, genre, publicationYear, isAvailable } = req.body;

        const updated = await prisma.bookItem.update({
            where: { id },
            data: {
                title,
                author,
                isbn,
                condition,
                genre,
                publicationYear: publicationYear ? parseInt(publicationYear) : null,
                isAvailable,
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== DELETE Book =====
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.bookItem.delete({ where: { id } });
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;