// server/routes/tasks.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Generate task ID (e.g., "#SL-88210")
const generateTaskId = () => {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `#SL-${random}`;
};

// ===== CREATE Task =====
router.post('/', async (req, res) => {
    try {
        const { donor, location, volume, status, userId } = req.body;

        const task = await prisma.task.create({
            data: {
                taskId: generateTaskId(),
                donor,
                location,
                volume,
                date: new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                status: status || 'Pending',
                userId,
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== READ ALL Tasks =====
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const where = userId ? { userId } : {};

        const tasks = await prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== UPDATE Task =====
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { donor, location, volume, status } = req.body;

        const task = await prisma.task.update({
            where: { id },
            data: { donor, location, volume, status }
        });

        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== UPDATE Task Status (for dropdown) =====
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const task = await prisma.task.update({
            where: { id },
            data: { status }
        });

        res.json(task);
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== DELETE Task =====
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({ where: { id } });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;