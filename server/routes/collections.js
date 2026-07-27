// server/routes/collections.js
const express = require('express');
const { prisma } = require('../db');
const router = express.Router();

// ===== CREATE Collection =====
router.post('/', async (req, res) => {
    try {
        const { title, description, category, stock, pointsRequired, isRare, imageUrl, cashPrice, userId } = req.body;

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const collection = await prisma.bookCollection.create({
            data: {
                title,
                slug,
                description,
                category,
                stock: parseInt(stock),
                pointsRequired: parseInt(pointsRequired),
                isRare: isRare || false,
                imageUrl,
                cashPrice: cashPrice ? parseFloat(cashPrice) : null,
            }
        });

        res.status(201).json(collection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== READ ALL Collections =====
router.get('/', async (req, res) => {
    try {
        const collections = await prisma.bookCollection.findMany({
            include: { books: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== UPDATE Collection =====
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, stock, pointsRequired, isRare, imageUrl, cashPrice } = req.body;

        const updated = await prisma.bookCollection.update({
            where: { id },
            data: {
                title,
                description,
                category,
                stock: parseInt(stock),
                pointsRequired: parseInt(pointsRequired),
                isRare,
                imageUrl,
                cashPrice: cashPrice ? parseFloat(cashPrice) : null,
            },
            include: { books: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== DELETE Collection =====
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.bookCollection.delete({ where: { id } });
        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;