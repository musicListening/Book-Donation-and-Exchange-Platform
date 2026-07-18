// server/routes/tasks.js
const express = require('express');
const router = express.Router();
const { prisma } = require('../db');

// GET ALL TASKS
router.get('/', async (req, res) => {
  try {
    // REMOVED token check for development
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Always return an array, even if empty
    res.json(tasks || []);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Return empty array instead of error to prevent UI crash
    res.json([]);
  }
});

// GET TASKS BY USER
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tasks = await prisma.task.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks || []);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.json([]);
  }
});

// CREATE TASK
router.post('/', async (req, res) => {
  try {
    const { donor, location, volume, status, userId } = req.body;

    const task = await prisma.task.create({
      data: {
        taskId: `TASK-${Date.now().toString().slice(-6)}`,
        donor: donor || 'Unknown Donor',
        location: location || 'Unknown Location',
        volume: volume || '0 Books',
        date: new Date().toISOString().split('T')[0],
        status: status || 'Pending',
        userId: userId || 'test-user-123'
      }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE TASK
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { donor, location, volume, status } = req.body;

    const updated = await prisma.task.update({
      where: { id },
      data: { 
        donor, 
        location, 
        volume, 
        status 
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE TASK
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;