// server/routes/orders.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

const MAX_ORDERS_PER_DRIVER = 5;

// Helper function to get driver's active order count
async function getDriverActiveOrders(driverId) {
  const count = await prisma.order.count({
    where: {
      driverId: driverId,
      status: { in: ['PENDING', 'PROCESSING'] }
    }
  });
  return count;
}

// Helper function to update driver status in database
async function updateDriverStatus(driverId) {
  const activeOrders = await getDriverActiveOrders(driverId);
  
  const updated = await prisma.user.update({
    where: { id: driverId },
    data: {
      activeOrders: activeOrders,
      status: activeOrders === 0 ? 'AVAILABLE' : 'ACTIVE',
      updatedAt: new Date()
    }
  });
  
  console.log(`✅ Driver ${updated.name}: ${activeOrders} active orders, status: ${updated.status}`);
  return updated;
}

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

    // Get driver active order counts
    const driverIds = orders.map(o => o.driverId).filter(Boolean);
    const driverOrderCounts = {};
    if (driverIds.length > 0) {
      const drivers = await prisma.user.findMany({
        where: { id: { in: driverIds } },
        select: { id: true, activeOrders: true, status: true }
      });
      drivers.forEach(d => {
        driverOrderCounts[d.id] = d.activeOrders || 0;
      });
    }

    // Add driver order count to each order
    const ordersWithDriverInfo = orders.map(order => ({
      ...order,
      driverActiveOrders: order.driverId ? driverOrderCounts[order.driverId] || 0 : 0
    }));

    res.json(ordersWithDriverInfo);
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

    // Check if driver exists
    const driver = await prisma.user.findUnique({
      where: { id: driverId }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    if (driver.role !== 'DELIVERY_PERSONNEL') {
      return res.status(400).json({ error: 'User is not delivery personnel' });
    }

    if (!driver.isActive) {
      return res.status(400).json({ error: 'Driver is not active' });
    }

    // Get ACTIVE order count from database
    const activeOrders = await getDriverActiveOrders(driverId);

    console.log(`📊 Driver ${driver.name} has ${activeOrders} active orders`);

    // Check if driver has reached max orders
    if (activeOrders >= MAX_ORDERS_PER_DRIVER) {
      return res.status(400).json({ 
        error: `Driver is at capacity (${activeOrders}/${MAX_ORDERS_PER_DRIVER} orders)`,
        activeOrders,
        maxOrders: MAX_ORDERS_PER_DRIVER,
        remainingCapacity: 0
      });
    }

    const remainingCapacity = MAX_ORDERS_PER_DRIVER - activeOrders;

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

    // CRITICAL: Update driver in database
    const updatedDriver = await updateDriverStatus(driverId);

    console.log(`✅ ${driver.name} assigned (${updatedDriver.activeOrders}/${MAX_ORDERS_PER_DRIVER})`);

    // Create delivery update log
    try {
      await prisma.deliveryUpdate.create({
        data: {
          orderId: orderId,
          status: 'PROCESSING',
          note: `Assigned to ${driverName || driver.name} by ${staffId || 'staff'} (${updatedDriver.activeOrders}/${MAX_ORDERS_PER_DRIVER} orders)`,
        }
      });
    } catch (error) {
      console.log('Note: DeliveryUpdate creation skipped');
    }

    // Get updated driver info
    const driverInfo = await prisma.user.findUnique({
      where: { id: driverId },
      select: { activeOrders: true, status: true }
    });

    res.json({
      ...updatedOrder,
      driverCapacity: {
        activeOrders: driverInfo?.activeOrders || 0,
        maxOrders: MAX_ORDERS_PER_DRIVER,
        remainingCapacity: MAX_ORDERS_PER_DRIVER - (driverInfo?.activeOrders || 0),
        isFull: (driverInfo?.activeOrders || 0) >= MAX_ORDERS_PER_DRIVER,
        status: driverInfo?.status || 'ACTIVE'
      }
    });

  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ error: 'Failed to assign delivery personnel: ' + error.message });
  }
});

// ===== UPDATE ORDER STATUS =====
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, updatedBy, location } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Get current order with driver info
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousStatus = currentOrder.status;
    const driverId = currentOrder.driverId;

    // Update order status
    const updateData = {
      status,
      updatedAt: new Date()
    };

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

    // CRITICAL: Update driver status in database if order is COMPLETED or CANCELLED
    if ((status === 'COMPLETED' || status === 'CANCELLED') && driverId) {
      try {
        // Update driver in database
        const updatedDriver = await updateDriverStatus(driverId);
        
        console.log(`✅ Driver ${updatedDriver.name}: ${updatedDriver.activeOrders} active orders remaining`);
        
      } catch (error) {
        console.error('⚠️ Error updating driver status:', error.message);
      }
    }

    // Create delivery update log
    try {
      await prisma.deliveryUpdate.create({
        data: {
          orderId: id,
          status: status,
          note: note || `Order status updated from ${previousStatus} to ${status}${location ? ` at ${location}` : ''}`,
          location: location || null
        }
      });
    } catch (error) {
      console.log('Note: DeliveryUpdate creation skipped');
    }

    console.log(`✅ Order ${id} status updated from ${previousStatus} to ${status} by ${updatedBy || 'staff'}`);
    res.json(updated);

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== GET Orders by Driver ID =====
router.get('/driver/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const orders = await prisma.order.findMany({
      where: { driverId },
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

    // Get driver's active order count from database
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
      select: { 
        activeOrders: true, 
        status: true,
        name: true,
        email: true,
        phoneNumber: true
      }
    });

    res.json({
      orders: orders,
      driver: driver || null,
      driverActiveOrders: driver?.activeOrders || 0,
      maxOrders: MAX_ORDERS_PER_DRIVER,
      remainingCapacity: MAX_ORDERS_PER_DRIVER - (driver?.activeOrders || 0),
      isFull: (driver?.activeOrders || 0) >= MAX_ORDERS_PER_DRIVER
    });
  } catch (error) {
    console.error('Error fetching driver orders:', error);
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

    const driverId = order.driverId;

    // Delete order
    await prisma.order.delete({
      where: { id }
    });

    // CRITICAL: Update driver status in database if order had a driver
    if (driverId) {
      try {
        const updatedDriver = await updateDriverStatus(driverId);
        console.log(`✅ Driver ${updatedDriver.name}: ${updatedDriver.activeOrders} active orders remaining`);
      } catch (error) {
        console.log('⚠️ Error updating driver status:', error.message);
      }
    }

    console.log(`✅ Order ${id} deleted`);
    res.json({ message: 'Order deleted successfully' });

  } catch (error) {
    console.error('Delete order error:', error);
    if (error.code === 'P2003' || error.code === 'P2014') {
      return res.status(409).json({ error: 'Cannot delete order with existing related records.' });
    }
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;