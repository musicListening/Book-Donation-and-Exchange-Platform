const express = require('express');
const jwt = require('jsonwebtoken');
const { prisma } = require('../db');

const router = express.Router();
const COMMUNITY_POST_TITLE = '__community_conversation__';
const COMMUNITY_POST_DESCRIPTION = 'Shared customer community conversation.';

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_change_me');
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}

function requireCommunityAdmin(req, res, next) {
  if (req.auth.role !== 'COMMUNITY_ADMIN') {
    return res.status(403).json({ error: 'Community administrator access is required.' });
  }
  next();
}

async function getConversationPost() {
  let post = await prisma.eventPost.findFirst({
    where: { title: COMMUNITY_POST_TITLE },
  });

  if (!post) {
    post = await prisma.eventPost.create({
      data: {
        title: COMMUNITY_POST_TITLE,
        description: COMMUNITY_POST_DESCRIPTION,
        eventDate: new Date(0),
        createdBy: 'system',
      },
    });
  }

  return post;
}

function eventSelect() {
  return {
    id: true,
    title: true,
    description: true,
    imageUrl: true,
    eventDate: true,
    venue: true,
    createdAt: true,
    createdBy: true,
    _count: { select: { likes: true, comments: true } },
  };
}

// Events published by community administrators.
router.get('/events', authenticate, async (req, res) => {
  try {
    const events = await prisma.eventPost.findMany({
      where: { NOT: { title: COMMUNITY_POST_TITLE } },
      select: eventSelect(),
      orderBy: { eventDate: 'asc' },
    });
    res.json(events);
  } catch (error) {
    console.error('Fetch community events error:', error);
    res.status(500).json({ error: 'Unable to load events.' });
  }
});

router.post('/events', authenticate, requireCommunityAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, eventDate, venue } = req.body;
    if (!title?.trim() || !description?.trim() || !eventDate) {
      return res.status(400).json({ error: 'Title, description, and event date are required.' });
    }

    const event = await prisma.eventPost.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl?.trim() || null,
        eventDate: new Date(eventDate),
        venue: venue?.trim() || null,
        createdBy: req.auth.userId,
      },
      select: eventSelect(),
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create community event error:', error);
    res.status(500).json({ error: 'Unable to create the event.' });
  }
});

router.put('/events/:id', authenticate, requireCommunityAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, eventDate, venue } = req.body;
    if (!title?.trim() || !description?.trim() || !eventDate) {
      return res.status(400).json({ error: 'Title, description, and event date are required.' });
    }

    const event = await prisma.eventPost.update({
      where: { id: req.params.id },
      data: {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl?.trim() || null,
        eventDate: new Date(eventDate),
        venue: venue?.trim() || null,
      },
      select: eventSelect(),
    });
    res.json(event);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Event not found.' });
    console.error('Update community event error:', error);
    res.status(500).json({ error: 'Unable to update the event.' });
  }
});

router.delete('/events/:id', authenticate, requireCommunityAdmin, async (req, res) => {
  try {
    await prisma.eventPost.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Event not found.' });
    console.error('Delete community event error:', error);
    res.status(500).json({ error: 'Unable to delete the event.' });
  }
});

// A shared group conversation stored as comments on one existing EventPost record.
router.get('/messages', authenticate, async (req, res) => {
  try {
    const conversation = await getConversationPost();
    const messages = await prisma.eventComment.findMany({
      where: { postId: conversation.id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    console.error('Fetch community messages error:', error);
    res.status(500).json({ error: 'Unable to load community messages.' });
  }
});

router.post('/messages', authenticate, async (req, res) => {
  try {
    if (req.auth.role !== 'END_USER') {
      return res.status(403).json({ error: 'Only customer accounts can post community messages.' });
    }

    const content = req.body.content?.trim();
    if (!content) return res.status(400).json({ error: 'A message cannot be empty.' });
    if (content.length > 1000) return res.status(400).json({ error: 'Messages must be 1000 characters or fewer.' });

    const user = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { id: true, isActive: true } });
    if (!user?.isActive) return res.status(403).json({ error: 'Your account cannot post messages.' });

    const conversation = await getConversationPost();
    const message = await prisma.eventComment.create({
      data: { postId: conversation.id, userId: req.auth.userId, content },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    res.status(201).json(message);
  } catch (error) {
    console.error('Create community message error:', error);
    res.status(500).json({ error: 'Unable to send your message.' });
  }
});

router.delete('/messages/:id', authenticate, async (req, res) => {
  try {
    const message = await prisma.eventComment.findUnique({ where: { id: req.params.id } });
    if (!message) return res.status(404).json({ error: 'Message not found.' });

    const isOwner = message.userId === req.auth.userId;
    const isAdmin = req.auth.role === 'COMMUNITY_ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You cannot delete this message.' });
    }

    await prisma.eventComment.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    console.error('Delete community message error:', error);
    res.status(500).json({ error: 'Unable to delete the message.' });
  }
});

// Aggregate counts for the Community Admin dashboard, backed entirely by
// existing User / EventPost / EventComment records.
router.get('/stats', authenticate, requireCommunityAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const conversation = await getConversationPost();

    const [totalUsers, eventsThisMonth, messagesToday, totalMessages] = await Promise.all([
      prisma.user.count({ where: { role: 'END_USER', isActive: true } }),
      prisma.eventPost.count({ where: { NOT: { title: COMMUNITY_POST_TITLE }, eventDate: { gte: startOfMonth } } }),
      prisma.eventComment.count({ where: { postId: conversation.id, createdAt: { gte: startOfToday } } }),
      prisma.eventComment.count({ where: { postId: conversation.id } }),
    ]);

    res.json({ totalUsers, eventsThisMonth, messagesToday, totalMessages });
  } catch (error) {
    console.error('Fetch community stats error:', error);
    res.status(500).json({ error: 'Unable to load dashboard stats.' });
  }
});

module.exports = router;