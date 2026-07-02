// server/routes/orders.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// ===== READ ALL Orders =====
router.get('/', async (req, res) => {
    try {
        const { userId, status } = req.query;
        const where = {};
        if (userId) where.userId = userId;
        if (status) where.status = status;

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        bookItem: true,
                        collection: true,
                        craftListing: true
                    }
                },
                user: true,
                deliveryUpdates: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== UPDATE Order Status =====
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.order.update({
            where: { id },
            data: {
                status,
                // Auto-set timestamps based on status
                ...(status === 'PROCESSING' && { processedAt: new Date() }),
                ...(status === 'COMPLETED' && { deliveredAt: new Date() }),
            },
            include: { items: true, user: true }
        });

        // Create delivery update log
        await prisma.deliveryUpdate.create({
            data: {
                orderId: id,
                status,
                note: `Order status updated to ${status}`,
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== GET Single Order =====
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        bookItem: true,
                        collection: true,
                        craftListing: true
                    }
                },
                user: true,
                deliveryUpdates: true,
                Payment: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;