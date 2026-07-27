const express = require('express');
const router = express.Router();
const { prisma } = require('../db');
const { uploadBook, uploadToCloudinary } = require('../config/cloudinary');

// GET /api/crafts — List crafts (filterable by status)
router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const crafts = await prisma.craftListing.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(crafts);
  } catch (error) {
    console.error('Fetch crafts error:', error);
    res.status(500).json({ error: 'Failed to fetch crafts' });
  }
});

// POST /api/crafts — User submits craft listing
router.post('/', uploadBook.single('image'), async (req, res) => {
  try {
    const { userId, title, description, pointsPrice } = req.body;

    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      imageUrl = result.secure_url;
    }

    const craft = await prisma.craftListing.create({
      data: {
        userId,
        title,
        description,
        pointsPrice: parseInt(pointsPrice),
        imageUrl,
        status: 'DRAFT',
      },
    });

    res.status(201).json(craft);
  } catch (error) {
    console.error('Create craft error:', error);
    res.status(500).json({ error: 'Failed to create craft listing' });
  }
});

// PATCH /api/crafts/:id/approve — Staff approves craft
router.patch('/:id/approve', async (req, res) => {
  try {
    const craft = await prisma.craftListing.update({
      where: { id: req.params.id },
      data: { status: 'LISTED' },
    });
    res.json(craft);
  } catch (error) {
    console.error('Approve craft error:', error);
    res.status(500).json({ error: 'Failed to approve craft' });
  }
});

// PATCH /api/crafts/:id/reject — Staff rejects craft
router.patch('/:id/reject', async (req, res) => {
  try {
    const craft = await prisma.craftListing.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });
    res.json(craft);
  } catch (error) {
    console.error('Reject craft error:', error);
    res.status(500).json({ error: 'Failed to reject craft' });
  }
});

// PUT /api/crafts/:id/image — Update craft image
router.put('/:id/image', uploadBook.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const result = await uploadToCloudinary(req.file);

    const craft = await prisma.craftListing.update({
      where: { id: req.params.id },
      data: { imageUrl: result.secure_url },
      select: { id: true, title: true, imageUrl: true },
    });

    res.json(craft);
  } catch (error) {
    console.error('Update craft image error:', error);
    res.status(500).json({ error: 'Failed to update craft image' });
  }
});

// PUT /api/crafts/:id — Update craft details
router.put('/:id', uploadBook.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, pointsPrice, status } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (pointsPrice !== undefined) data.pointsPrice = parseInt(pointsPrice);
    if (status !== undefined) data.status = status;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      data.imageUrl = result.secure_url;
    }

    const craft = await prisma.craftListing.update({
      where: { id },
      data,
    });

    res.json(craft);
  } catch (error) {
    console.error('Update craft error:', error);
    res.status(500).json({ error: 'Failed to update craft' });
  }
});

// DELETE /api/crafts/:id — Delete craft listing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await prisma.craftListing.delete({ where: { id } });
    } catch (e) {
      console.warn('Hard delete craft failed, applying soft delete ARCHIVED:', e.message);
      await prisma.craftListing.update({
        where: { id },
        data: { status: 'ARCHIVED' }
      });
    }
    res.json({ message: 'Craft deleted successfully' });
  } catch (error) {
    console.error('Delete craft error:', error);
    res.status(500).json({ error: 'Failed to delete craft' });
  }
});

module.exports = router;
