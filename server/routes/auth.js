const express = require('express');
const router = express.Router();
const { prisma } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body; 

        // Validate email domain
        const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'yahoomail.com'];
        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (!allowedDomains.includes(emailDomain)) {
            return res.status(400).json({ message: 'Only Gmail, Outlook, and Yahoo mail are allowed for registration.' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'END_USER', 
                points: 50,
            },
        });

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated. Contact an administrator.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'default_secret_key_change_me',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points, level: user.level, profileImage: user.profileImage }
        });

        prisma.loginLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                ip: req.ip || req.connection?.remoteAddress || null,
                userAgent: req.headers['user-agent'] || null,
            },
        }).catch(err => console.error('Login log error:', err));
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        await prisma.loginLog.create({
            data: {
                userId,
                action: 'LOGOUT',
                ip: req.ip || req.connection?.remoteAddress || null,
                userAgent: req.headers['user-agent'] || null,
            },
        });

        res.status(200).json({ message: 'Logout logged successfully' });
    } catch (error) {
        console.error('Logout log error:', error);
        res.status(500).json({ message: 'Server error during logout logging' });
    }
});

module.exports = router;