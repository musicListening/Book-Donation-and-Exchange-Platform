// server/routes/donations.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// ===== CREATE Donation Request =====
router.post('/', async (req, res) => {
    try {
        const { userId, type, collectionName, category, requestedCount, notes, dropOffDate } = req.body;

        const donation = await prisma.donationRequest.create({
            data: {
                userId,
                type,
                collectionName,
                category,
                requestedCount: parseInt(requestedCount),
                verifiedCount: 0,
                notes,
                dropOffDate: dropOffDate ? new Date(dropOffDate) : null,
                pointsAwarded: 0,
            }
        });

        res.status(201).json(donation);
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== READ ALL Donations =====
router.get('/', async (req, res) => {
    try {
        const { userId, status } = req.query;
        const where = {};
        if (userId) where.userId = userId;
        // Add status filtering if needed

        const donations = await prisma.donationRequest.findMany({
            where,
            include: { books: true, user: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== UPDATE Donation =====
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, collectionName, category, requestedCount, notes, dropOffDate } = req.body;

        const updated = await prisma.donationRequest.update({
            where: { id },
            data: {
                type,
                collectionName,
                category,
                requestedCount: parseInt(requestedCount),
                notes,
                dropOffDate: dropOffDate ? new Date(dropOffDate) : null,
            },
            include: { books: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating donation:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== DELETE Donation =====
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.donationRequest.delete({ where: { id } });
        res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;