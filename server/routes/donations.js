// server/routes/donations.js
const express = require('express');
const { prisma } = require('../db');
const router = express.Router();

// ===== CREATE Donation Request =====
router.post('/', async (req, res) => {
    try {
        const { userId, type, collectionName, category, requestedCount, notes, dropOffDate } = req.body;

        const donation = await prisma.donationRequest.create({
            data: {
                userId,
                type: type || 'SINGLE_BOOK',
                collectionName,
                category: category || 'General',
                requestedCount: parseInt(requestedCount) || 0,
                verifiedCount: 0,
                notes,
                dropOffDate: dropOffDate ? new Date(dropOffDate) : null,
                pointsAwarded: 0,
                status: 'PENDING',
                condition: null,
                awardedMysteryBox: false,
                staffNotes: null,
                isCollectionComplete: false
            },
            include: { user: true }
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
        if (status) where.status = status;

        const donations = await prisma.donationRequest.findMany({
            where,
            include: { 
                books: true, 
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        points: true,
                        level: true,
                        phoneNumber: true,
                        address: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== GET Single Donation =====
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await prisma.donationRequest.findUnique({
            where: { id },
            include: { 
                books: true, 
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        points: true,
                        level: true,
                        phoneNumber: true,
                        address: true
                    }
                }
            }
        });
        
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        
        res.json(donation);
    } catch (error) {
        console.error('Error fetching donation:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== UPDATE Donation =====
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            type, 
            collectionName, 
            category, 
            requestedCount, 
            notes, 
            dropOffDate,
            status,
            verifiedCount,
            condition,
            pointsAwarded,
            awardedMysteryBox,
            staffNotes,
            isCollectionComplete
        } = req.body;

        const updateData = {};
        
        if (type !== undefined && type !== null) updateData.type = type;
        if (collectionName !== undefined && collectionName !== null) updateData.collectionName = collectionName;
        if (category !== undefined && category !== null) updateData.category = category;
        if (requestedCount !== undefined && requestedCount !== null) {
            updateData.requestedCount = parseInt(requestedCount) || 0;
        }
        if (notes !== undefined && notes !== null) updateData.notes = notes;
        if (dropOffDate !== undefined) {
            updateData.dropOffDate = dropOffDate ? new Date(dropOffDate) : null;
        }
        if (status !== undefined && status !== null) updateData.status = status;
        if (verifiedCount !== undefined && verifiedCount !== null) {
            updateData.verifiedCount = parseInt(verifiedCount) || 0;
        }
        if (condition !== undefined && condition !== null) updateData.condition = condition;
        if (pointsAwarded !== undefined && pointsAwarded !== null) {
            updateData.pointsAwarded = parseInt(pointsAwarded) || 0;
        }
        if (awardedMysteryBox !== undefined) {
            updateData.awardedMysteryBox = awardedMysteryBox === true || awardedMysteryBox === 'true';
        }
        if (staffNotes !== undefined && staffNotes !== null) updateData.staffNotes = staffNotes;
        if (isCollectionComplete !== undefined) {
            updateData.isCollectionComplete = isCollectionComplete === true || isCollectionComplete === 'true';
        }

        if (status === 'VERIFIED') {
            updateData.verifiedDate = new Date();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        console.log('📤 Updating donation:', { id, updateData });

        const updated = await prisma.donationRequest.update({
            where: { id },
            data: updateData,
            include: { books: true, user: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating donation:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== ✅ UPDATE POINTS ONLY (Status stays PENDING) =====
router.patch('/:id/update-points', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            verifiedCount, 
            pointsAwarded, 
            awardedMysteryBox
        } = req.body;

        console.log('📤 Updating points only:', { 
            id, 
            verifiedCount, 
            pointsAwarded, 
            awardedMysteryBox 
        });

        // ✅ Only update points-related fields - status stays PENDING
        const updated = await prisma.donationRequest.update({
            where: { id },
            data: {
                verifiedCount: parseInt(verifiedCount) || 0,
                pointsAwarded: parseInt(pointsAwarded) || 0,
                awardedMysteryBox: awardedMysteryBox === true || awardedMysteryBox === 'true',
                // ✅ DO NOT change status - stays PENDING
            },
            include: { user: true }
        });

        console.log('✅ Points updated (status still PENDING):', updated);
        res.json(updated);
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== VERIFY Donation (Changes status to VERIFIED) =====
router.patch('/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            verifiedCount, 
            condition, 
            notes, 
            pointsAwarded, 
            awardedMysteryBox,
            staffNotes,
            isCollectionComplete
        } = req.body;

        console.log('📤 Verifying donation (status -> VERIFIED):', { 
            id, 
            verifiedCount, 
            condition, 
            notes, 
            pointsAwarded, 
            awardedMysteryBox,
            staffNotes,
            isCollectionComplete 
        });

        const updated = await prisma.donationRequest.update({
            where: { id },
            data: {
                status: 'VERIFIED',
                verifiedCount: parseInt(verifiedCount) || 0,
                condition: condition || 'good',
                notes: notes || '',
                pointsAwarded: parseInt(pointsAwarded) || 0,
                awardedMysteryBox: awardedMysteryBox === true || awardedMysteryBox === 'true',
                staffNotes: staffNotes || '',
                isCollectionComplete: isCollectionComplete === true || isCollectionComplete === 'true',
                verifiedDate: new Date()
            },
            include: { user: true }
        });

        console.log('✅ Donation verified:', updated);
        res.json(updated);
    } catch (error) {
        console.error('Error verifying donation:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== REJECT Donation =====
router.patch('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        console.log('📤 Rejecting donation:', { id, notes });

        const updated = await prisma.donationRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                staffNotes: notes || 'Rejected by staff'
            },
            include: { user: true }
        });

        console.log('❌ Donation rejected:', updated);
        res.json(updated);
    } catch (error) {
        console.error('Error rejecting donation:', error);
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

// ===== GET Donations by User =====
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const donations = await prisma.donationRequest.findMany({
            where: { userId },
            include: { books: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(donations);
    } catch (error) {
        console.error('Error fetching user donations:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== GET Donation Stats =====
router.get('/stats', async (req, res) => {
    try {
        const [total, pending, verified, rejected] = await Promise.all([
            prisma.donationRequest.count(),
            prisma.donationRequest.count({ where: { status: 'PENDING' } }),
            prisma.donationRequest.count({ where: { status: 'VERIFIED' } }),
            prisma.donationRequest.count({ where: { status: 'REJECTED' } })
        ]);

        const totalBooks = await prisma.donationRequest.aggregate({
            _sum: { verifiedCount: true }
        });

        res.json({
            total,
            pending,
            verified,
            rejected,
            totalBooksVerified: totalBooks._sum.verifiedCount || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;