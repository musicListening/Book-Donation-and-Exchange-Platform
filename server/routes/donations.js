const express = require('express');
const { prisma } = require('../db');
const { calculateDonationPoints, calculateLevelByBooks } = require('../utils/pointsCalculator');
const { uploadDonation, uploadToCloudinaryMultiple } = require('../config/cloudinary');
const router = express.Router();

// ===== CREATE Donation Request =====
router.post('/', uploadDonation.array('images', 10), async (req, res) => {
    try {
        const { userId, type, collectionName, category, requestedCount, notes, dropOffDate, timeSlot } = req.body;

        // Upload donor images to Cloudinary
        let donationImages = [];
        if (req.files && req.files.length > 0) {
            donationImages = await uploadToCloudinaryMultiple(req.files);
        }

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
                timeSlot: timeSlot || 'Morning (10:00 AM - 12:00 PM)',
                pointsAwarded: 0,
                donationImages,
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

// ===== POINTS PREVIEW =====
router.get('/points-preview', async (req, res) => {
    try {
        const { count, isCollection } = req.query;
        const points = await calculateDonationPoints(
            parseInt(count) || 0,
            isCollection === 'true'
        );
        res.json(points);
    } catch (error) {
        console.error('Error calculating points preview:', error);
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

        const updated = await prisma.donationRequest.update({
            where: { id },
            data: {
                verifiedCount: parseInt(verifiedCount) || 0,
                pointsAwarded: parseInt(pointsAwarded) || 0,
                awardedMysteryBox: awardedMysteryBox === true || awardedMysteryBox === 'true',
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
            staffId,
            isCollectionComplete,
            category
        } = req.body;

        const donation = await prisma.donationRequest.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!donation) return res.status(404).json({ error: 'Donation not found' });

        const isCollection = donation.type === 'COLLECTION' || isCollectionComplete;
        const points = await calculateDonationPoints(parseInt(verifiedCount) || 0, isCollection);

        const user = donation.user;
        const newBooksDonated = (user.booksDonated || 0) + (parseInt(verifiedCount) || 0);
        const newLevel = await calculateLevelByBooks(newBooksDonated);
        const newPoints = (user.points || 0) + points.total;
        const leveledUp = newLevel > (user.level !== undefined && user.level !== null ? user.level : 0);

        // Update donation with category if provided
        const updateData = {
            status: 'VERIFIED',
            verifiedCount: parseInt(verifiedCount) || 0,
            condition: condition || 'good',
            notes: notes || '',
            pointsAwarded: points.total,
            staffNotes: req.body.staffNotes || '',
            isCollectionComplete: isCollection,
            verifiedDate: new Date(),
            verifiedBy: staffId || null
        };

        // If category is provided, update it
        if (category) {
            updateData.category = category;
        }

        const updated = await prisma.donationRequest.update({
            where: { id },
            data: updateData,
            include: { user: true }
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { points: newPoints, booksDonated: newBooksDonated, level: newLevel }
        });

        await prisma.pointTransaction.create({
            data: {
                userId: user.id,
                type: 'EARNED_DONATION',
                amount: points.total,
                description: `Verified ${verifiedCount} book(s) - ${points.baseRate} pts/book`,
                relatedDonationId: id,
                staffId: staffId || null
            }
        });

        if (points.bonus > 0) {
            await prisma.pointTransaction.create({
                data: {
                    userId: user.id,
                    type: 'EARNED_BONUS',
                    amount: points.bonus,
                    description: `Collection bonus (${points.bonusPct}%)`,
                    relatedDonationId: id,
                    staffId: staffId || null
                }
            });
        }

        if (leveledUp) {
            const levelConfig = await prisma.level.findUnique({ where: { level: newLevel } });
            const hasMysteryBox = levelConfig?.mysteryBoxUnlock && levelConfig.mysteryBoxUnlock.trim() !== '';

            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'LEVEL_UP',
                    title: 'Level Up!',
                    message: hasMysteryBox
                        ? `Congratulations! You've reached Level ${newLevel} (${levelConfig.name})! A Mystery Box has been assigned to you.`
                        : `Congratulations! You've reached Level ${newLevel} (${levelConfig?.name || ''})!`
                }
            });

            if (hasMysteryBox) {
                const boxBookCount = levelConfig.mysteryBoxBooks || 5;

                const availableBooks = await prisma.bookItem.findMany({
                    where: { isAvailable: true, condition: { in: ['NEW', 'LIKE_NEW', 'GOOD'] } }
                });

                const shuffled = [...availableBooks].sort(() => 0.5 - Math.random());
                const selectedBooks = shuffled.slice(0, Math.min(boxBookCount, shuffled.length));

                // ✅ FIX: Add updatedAt here
                const mysteryBox = await prisma.mysteryBox.create({
                    data: {
                        userId: user.id,
                        level: newLevel,
                        status: 'UNCLAIMED',
                        assignedBy: staffId || null,
                        description: `${levelConfig.mysteryBoxUnlock} - ${selectedBooks.length} books`,
                        updatedAt: new Date(),
                    }
                });

                for (const book of selectedBooks) {
                    await prisma.bookItem.update({
                        where: { id: book.id },
                        data: { mysteryBoxId: mysteryBox.id, isAvailable: false, collectionId: null }
                    });
                    if (book.collectionId) {
                        await prisma.bookCollection.update({
                            where: { id: book.collectionId },
                            data: { stock: { decrement: 1 } }
                        }).catch(() => {});
                    }
                }

                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'MYSTERY_BOX_REWARD',
                        title: 'Mystery Box Awarded!',
                        message: `You've received a ${levelConfig.mysteryBoxUnlock} with ${selectedBooks.length} books! Points cost to claim: ${levelConfig.mysteryBoxPoints || 0}.`
                    }
                });
            }
        }

        // Create BookItem or CraftListing records for verified items
        const isCraft = donation.category && donation.category.startsWith('Craft:');
        const bookItems = [];
        const craftListings = [];
        const { bundleId, addToMarketplace } = req.body;
        
        let finalBundleId = bundleId || null;
        if (!finalBundleId && !isCraft && donation.category) {
            let existingBundle = await prisma.bookCollection.findFirst({
                where: { category: donation.category }
            });
            
            if (!existingBundle) {
                existingBundle = await prisma.bookCollection.create({
                    data: {
                        title: `${donation.category} Collection`,
                        slug: `${donation.category.toLowerCase().replace(/\s+/g, '-')}-collection-${Date.now()}`,
                        category: donation.category,
                        stock: 0,
                        pointsRequired: 0,
                        type: 'STANDARD'
                    }
                });
                console.log(`📦 Auto-created bundle: ${existingBundle.title}`);
            }
            finalBundleId = existingBundle.id;
        }

        let dbCondition = 'GOOD';
        if (condition) {
            const condUpper = condition.toUpperCase();
            if (condUpper === 'EXCELLENT' || condUpper === 'NEW') dbCondition = 'NEW';
            else if (condUpper === 'LIKE_NEW') dbCondition = 'LIKE_NEW';
            else if (condUpper === 'GOOD') dbCondition = 'GOOD';
            else if (condUpper === 'FAIR') dbCondition = 'FAIR';
            else if (condUpper === 'POOR') dbCondition = 'POOR';
        }

        const notesPointsMatch = donation.notes && donation.notes.match(/Expected Points:\s*(\d+)/i);
        const specifiedPoints = notesPointsMatch ? parseInt(notesPointsMatch[1]) : null;
        const initialPointsPrice = specifiedPoints || ((condition === 'NEW' || condition === 'excellent') ? 50 : (condition === 'LIKE_NEW' || condition === 'good') ? 40 : (condition === 'GOOD') ? 30 : (condition === 'FAIR' || condition === 'fair') ? 20 : 10);

        if (isCraft) {
            for (let i = 0; i < (parseInt(verifiedCount) || 0); i++) {
                const craftTitle = donation.collectionName || (donation.category.replace(/^Craft:\s*/, '') + (parseInt(verifiedCount) > 1 ? ` #${i + 1}` : ''));
                const craft = await prisma.craftListing.create({
                    data: {
                        userId: donation.userId,
                        title: craftTitle,
                        description: `Donated craft item: ${donation.category} in ${condition || 'GOOD'} condition.`,
                        pointsPrice: initialPointsPrice,
                        imageUrl: donation.donationImages && donation.donationImages.length > 0 ? donation.donationImages[0] : '',
                        additionalImages: donation.donationImages || [],
                        status: addToMarketplace === true || addToMarketplace === 'true' ? 'LISTED' : 'DRAFT',
                        donationRequestId: donation.id
                    }
                });
                craftListings.push(craft);
            }
        } else {
            for (let i = 0; i < (parseInt(verifiedCount) || 0); i++) {
                const bookTitle = (donation.collectionName || donation.category || 'Donated Book').replace(/\s*#\d+$/i, '').trim();
                const bookItem = await prisma.bookItem.create({
                    data: {
                        title: bookTitle,
                        condition: dbCondition,
                        isDonated: true,
                        donationRequestId: donation.id,
                        collectionId: finalBundleId,
                        isAvailable: addToMarketplace === true || addToMarketplace === 'true' ? true : false,
                        addedToMarketplaceAt: addToMarketplace === true || addToMarketplace === 'true' ? new Date() : null,
                        pointsPrice: initialPointsPrice,
                        imageUrl: donation.donationImages && donation.donationImages.length > 0 ? donation.donationImages[0] : null,
                    },
                });
                bookItems.push(bookItem);
            }
        }

        if (finalBundleId && bookItems.length > 0) {
            await prisma.bookCollection.update({
                where: { id: finalBundleId },
                data: { stock: { increment: bookItems.length } }
            });
        }

        res.json({
            donation: updated,
            bookItems,
            craftListings,
            points,
            leveledUp,
            newLevel,
            newPoints,
            newBooksDonated
        });
    } catch (error) {
        console.error('Error verifying donation:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== PUBLISH TO MARKETPLACE =====
router.post('/:id/publish-marketplace', async (req, res) => {
    try {
        const { id } = req.params;
        const { price, description, condition, title, quantity } = req.body;

        const donation = await prisma.donationRequest.findUnique({
            where: { id }
        });
        if (!donation) return res.status(404).json({ error: 'Donation not found' });

        const isCraft = donation.category && donation.category.startsWith('Craft:');
        const pointsPrice = parseInt(price) || 0;

        if (isCraft) {
            const count = await prisma.craftListing.count({ where: { donationRequestId: id } });
            if (count === 0) {
                await prisma.craftListing.create({
                    data: {
                        userId: donation.userId,
                        title: title || donation.collectionName || donation.category.replace(/^Craft:\s*/, '') || 'Donated Craft',
                        description: description || `Donated craft item: ${donation.category} in ${condition || 'GOOD'} condition.`,
                        pointsPrice,
                        imageUrl: donation.donationImages && donation.donationImages.length > 0 ? donation.donationImages[0] : '',
                        additionalImages: donation.donationImages || [],
                        status: 'LISTED',
                        donationRequestId: donation.id
                    }
                });
            } else {
                await prisma.craftListing.updateMany({
                    where: { donationRequestId: id },
                    data: {
                        status: 'LISTED',
                        pointsPrice,
                        description: description || `Donated craft item in ${condition || 'GOOD'} condition.`,
                        title: title || undefined,
                    }
                });
            }
        } else {
            const count = await prisma.bookItem.count({ where: { donationRequestId: id } });
            const targetQty = parseInt(quantity) || 1;
            
            if (count > 0) {
                await prisma.bookItem.updateMany({
                    where: { donationRequestId: id },
                    data: {
                        isAvailable: true,
                        addedToMarketplaceAt: new Date(),
                        pointsPrice,
                        title: title || undefined,
                    }
                });
            }
            
            const itemsToCreate = Math.max(0, targetQty - count);
            if (itemsToCreate > 0) {
                const newItems = Array.from({ length: itemsToCreate }).map(() => ({
                    title: title || donation.collectionName || donation.category || 'Donated Book',
                    condition: condition || 'GOOD',
                    isDonated: true,
                    donationRequestId: donation.id,
                    isAvailable: true,
                    addedToMarketplaceAt: new Date(),
                    pointsPrice,
                    imageUrl: donation.donationImages && donation.donationImages.length > 0 ? donation.donationImages[0] : null,
                }));
                await prisma.bookItem.createMany({ data: newItems });
            }
        }

        res.json({ message: 'Items published to marketplace successfully' });
    } catch (error) {
        console.error('Error publishing to marketplace:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== ASSIGN Mystery Box to user after verification =====
router.post('/:id/mystery-box', async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId } = req.body;

        const donation = await prisma.donationRequest.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!donation) return res.status(404).json({ error: 'Donation not found' });

        const user = donation.user;
        const levelConfig = await prisma.level.findUnique({ where: { level: user.level } });
        const hasMysteryBox = levelConfig?.mysteryBoxUnlock && levelConfig.mysteryBoxUnlock.trim() !== '';
        if (!hasMysteryBox) return res.status(400).json({ error: `Level ${user.level} does not have a mystery box configured. Configure one in System Config.` });

        const bookCount = levelConfig.mysteryBoxBooks || 5;

        const availableBooks = await prisma.bookItem.findMany({
            where: { isAvailable: true, condition: { in: ['NEW', 'LIKE_NEW', 'GOOD'] } }
        });

        const shuffled = [...availableBooks].sort(() => 0.5 - Math.random());
        const selectedBooks = shuffled.slice(0, Math.min(bookCount, shuffled.length));

        // ✅ FIX: Add updatedAt here
        const mysteryBox = await prisma.mysteryBox.create({
            data: {
                userId: user.id,
                level: user.level,
                status: 'UNCLAIMED',
                assignedBy: staffId || null,
                description: `${levelConfig.mysteryBoxUnlock} - ${selectedBooks.length} books`,
                updatedAt: new Date(),
            }
        });

        for (const book of selectedBooks) {
            await prisma.bookItem.update({
                where: { id: book.id },
                data: { mysteryBoxId: mysteryBox.id, isAvailable: false, collectionId: null }
            });
            if (book.collectionId) {
                await prisma.bookCollection.update({
                    where: { id: book.collectionId },
                    data: { stock: { decrement: 1 } }
                }).catch(() => {});
            }
        }

        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'MYSTERY_BOX_REWARD',
                title: 'Mystery Box Awarded!',
                message: `You've received a Mystery Box with ${selectedBooks.length} books! Check your dashboard to claim it.`
            }
        });

        const result = await prisma.mysteryBox.findUnique({
            where: { id: mysteryBox.id },
            include: { books: true }
        });

        res.json(result);
    } catch (error) {
        console.error('Error assigning mystery box:', error);
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

// ===== COMPLETE Donation (by user) =====
router.put('/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await prisma.$transaction(async (tx) => {
            const donation = await tx.donationRequest.findUnique({ where: { id } });
            
            if (!donation) throw new Error('Donation not found');
            if (donation.pointsAwarded > 0) throw new Error('Already completed');

            const pointsToAdd = donation.requestedCount * 10;

            const updatedDonation = await tx.donationRequest.update({
                where: { id },
                data: { pointsAwarded: pointsToAdd }
            });

            const updatedUser = await tx.user.update({
                where: { id: donation.userId },
                data: { points: { increment: pointsToAdd } }
            });

            return { updatedDonation, updatedUser };
        });

        res.json(result);
    } catch (error) {
        console.error('Error completing donation:', error);
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