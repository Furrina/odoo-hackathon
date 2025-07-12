const express = require('express');
const User = require('../models/User');
const Swap = require('../models/Swap');
const Message = require('../models/Message');
const { adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Ban/unban user
router.put('/users/:id/ban', adminAuth, async (req, res) => {
    try {
        const { isBanned } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBanned },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all swaps (admin only)
router.get('/swaps', adminAuth, async (req, res) => {
    try {
        const swaps = await Swap.find({})
            .populate('requester', 'name email')
            .populate('recipient', 'name email')
            .sort({ createdAt: -1 });
        res.json(swaps);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get platform statistics
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSwaps = await Swap.countDocuments();
        const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
        const completedSwaps = await Swap.countDocuments({ status: 'completed' });
        const bannedUsers = await User.countDocuments({ isBanned: true });

        const stats = {
            totalUsers,
            totalSwaps,
            pendingSwaps,
            completedSwaps,
            bannedUsers,
            completionRate: totalSwaps > 0 ? (completedSwaps / totalSwaps * 100).toFixed(2) : 0
        };

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create platform-wide message
router.post('/messages', adminAuth, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('type').isIn(['info', 'warning', 'alert', 'update']).withMessage('Invalid message type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content, type } = req.body;
        const message = new Message({
            title,
            content,
            type,
            createdBy: req.user._id
        });

        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all platform messages
router.get('/messages', adminAuth, async (req, res) => {
    try {
        const messages = await Message.find({})
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update message status
router.put('/messages/:id', adminAuth, [
    body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { isActive } = req.body;
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).populate('createdBy', 'name');

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete message
router.delete('/messages/:id', adminAuth, async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user activity report
router.get('/reports/user-activity', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};

        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const users = await User.find(dateFilter).select('-password');
        const swaps = await Swap.find(dateFilter);

        const report = {
            period: { startDate, endDate },
            totalUsers: users.length,
            totalSwaps: swaps.length,
            newUsers: users.filter(user => user.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
            activeUsers: users.filter(user => !user.isBanned).length,
            bannedUsers: users.filter(user => user.isBanned).length
        };

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get swap statistics report
router.get('/reports/swap-stats', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};

        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const swaps = await Swap.find(dateFilter);
        
        const stats = {
            period: { startDate, endDate },
            totalSwaps: swaps.length,
            pendingSwaps: swaps.filter(swap => swap.status === 'pending').length,
            acceptedSwaps: swaps.filter(swap => swap.status === 'accepted').length,
            completedSwaps: swaps.filter(swap => swap.status === 'completed').length,
            rejectedSwaps: swaps.filter(swap => swap.status === 'rejected').length,
            cancelledSwaps: swaps.filter(swap => swap.status === 'cancelled').length,
            completionRate: swaps.length > 0 ? 
                (swaps.filter(swap => swap.status === 'completed').length / swaps.length * 100).toFixed(2) : 0
        };

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 