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

// ===== ASSIGN DELIVERY PERSONNEL TO ORDER =====
router.post('/assign-driver', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { orderId, driverId, driverName, staffId } = req.body;

        if (!orderId || !driverId) {
            return res.status(400).json({ error: 'Order ID and Driver ID are required' });
        }

        // Check if order exists
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if driver exists and is DELIVERY_PERSONNEL
        const driver = await prisma.user.findUnique({
            where: { id: driverId }
        });

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        if (driver.role !== 'DELIVERY_PERSONNEL') {
            return res.status(400).json({ error: 'User is not delivery personnel' });
        }

        // Update order with driver
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                driverId: driverId,
                driverName: driverName || driver.name,
                status: 'PROCESSING',
                processedAt: new Date(),
                updatedAt: new Date()
            },
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
            }
        });

        // Update driver status to ON_DELIVERY
        await prisma.user.update({
            where: { id: driverId },
            data: {
                status: 'ON_DELIVERY',
                updatedAt: new Date()
            }
        });

        // Create delivery update log
        try {
            await prisma.deliveryUpdate.create({
                data: {
                    orderId: orderId,
                    status: 'PROCESSING',
                    note: `Assigned to ${driverName || driver.name} by staff ${staffId || 'staff'}`,
                }
            });
        } catch (error) {
            console.log('Note: DeliveryUpdate creation skipped - table might not exist');
        }

        console.log(`✅ Driver ${driver.name} assigned to order ${orderId}`);
        res.json(updatedOrder);

    } catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({ error: 'Failed to assign delivery personnel: ' + error.message });
    }
});

// ===== UPDATE Order Status =====
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note, updatedBy, location } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const order = await prisma.order.findUnique({
            where: { id }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Build update data
        const updateData = {
            status,
            updatedAt: new Date()
        };

        // Auto-set timestamps based on status
        if (status === 'PROCESSING') {
            updateData.processedAt = new Date();
        } else if (status === 'COMPLETED') {
            updateData.deliveredAt = new Date();
        }

        const updated = await prisma.order.update({
            where: { id },
            data: updateData,
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
            }
        });

        // Create delivery update log
        try {
            await prisma.deliveryUpdate.create({
                data: {
                    orderId: id,
                    status: status,
                    note: note || `Order status updated to ${status}${location ? ` at ${location}` : ''}`,
                    location: location || null
                }
            });
        } catch (error) {
            console.log('Note: DeliveryUpdate creation skipped - table might not exist');
        }

        // If order is COMPLETED or CANCELLED, update driver status back to AVAILABLE
        if ((status === 'COMPLETED' || status === 'CANCELLED') && order.driverId) {
            try {
                await prisma.user.update({
                    where: { id: order.driverId },
                    data: {
                        status: 'AVAILABLE',
                        updatedAt: new Date()
                    }
                });
            } catch (error) {
                console.log('Note: User status update skipped - status column might not exist');
            }
        }

        console.log(`✅ Order ${id} status updated to ${status} by ${updatedBy || 'staff'}`);
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

// ===== DELETE ORDER =====
router.delete('/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Store driverId before deleting
        const driverId = order.driverId;

        // Delete order
        await prisma.order.delete({
            where: { id }
        });

        // If order had a driver, update driver status back to AVAILABLE
        if (driverId) {
            try {
                await prisma.user.update({
                    where: { id: driverId },
                    data: {
                        status: 'AVAILABLE',
                        updatedAt: new Date()
                    }
                });
            } catch (error) {
                console.log('Note: User status update skipped - status column might not exist');
            }
        }

        console.log(`✅ Order ${id} deleted`);
        res.json({ message: 'Order deleted successfully' });

    } catch (error) {
        console.error('Delete order error:', error);
        // Check if error is due to foreign key constraints
        if (error.code === 'P2003' || error.code === 'P2014') {
            return res.status(409).json({ error: 'Cannot delete order with existing related records.' });
        }
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// ===== GET ORDERS BY DRIVER =====
router.get('/driver/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;
        
        const orders = await prisma.order.findMany({
            where: {
                driverId: driverId
            },
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
        console.error('Error fetching driver orders:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;