// server/routes/shipments.js
const express = require('express');
const { prisma } = require('../db');
const router = express.Router();

// Generate order ID (e.g., "#SL-92410")
const generateOrderId = () => {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `#SL-${random}`;
};

// ===== CREATE Shipment =====
router.post('/', async (req, res) => {
    try {
        const { recipient, location, items, status, driver, userId } = req.body;

        const shipment = await prisma.shipment.create({
            data: {
                orderId: generateOrderId(),
                recipient,
                location,
                items,
                status: status || 'In Transit',
                lastUpdate: 'Just now',
                driver,
                userId,
            }
        });

        res.status(201).json(shipment);
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== READ ALL Shipments =====
router.get('/', async (req, res) => {
    try {
        const { userId, status } = req.query;
        const where = { userId };
        if (status && status !== 'All') {
            where.status = status;
        }

        const shipments = await prisma.shipment.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(shipments);
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== UPDATE Shipment =====
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { recipient, location, items, status, driver } = req.body;

        const shipment = await prisma.shipment.update({
            where: { id },
            data: {
                recipient,
                location,
                items,
                status,
                driver,
                lastUpdate: 'Just now'
            }
        });

        res.json(shipment);
    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== DELETE Shipment =====
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.shipment.delete({ where: { id } });
        res.json({ message: 'Shipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;