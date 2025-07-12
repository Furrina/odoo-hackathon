const express = require('express');
const Swap = require('../models/Swap');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create a new swap request
router.post('/', auth, [
    body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
    body('skillOffered').trim().notEmpty().withMessage('Skill offered is required'),
    body('skillRequested').trim().notEmpty().withMessage('Skill requested is required'),
    body('message').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { recipientId, skillOffered, skillRequested, message } = req.body;

        // Check if recipient exists and is not banned
        const recipient = await User.findById(recipientId);
        if (!recipient || recipient.isBanned) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Check if requester has the skill they're offering
        const requester = await User.findById(req.user._id);
        if (!requester.skillsOffered.includes(skillOffered)) {
            return res.status(400).json({ message: 'You must have this skill in your offered skills' });
        }

        // Check if recipient has the skill they're being asked for
        if (!recipient.skillsOffered.includes(skillRequested)) {
            return res.status(400).json({ message: 'Recipient does not offer this skill' });
        }

        // Check if there's already a pending swap between these users
        const existingSwap = await Swap.findOne({
            $or: [
                { requester: req.user._id, recipient: recipientId },
                { requester: recipientId, recipient: req.user._id }
            ],
            status: 'pending'
        });

        if (existingSwap) {
            return res.status(400).json({ message: 'You already have a pending swap with this user' });
        }

        const swap = new Swap({
            requester: req.user._id,
            recipient: recipientId,
            skillOffered,
            skillRequested,
            message
        });

        await swap.save();

        const populatedSwap = await Swap.findById(swap._id)
            .populate('requester', 'name')
            .populate('recipient', 'name');

        res.status(201).json(populatedSwap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's swaps (sent and received)
router.get('/my-swaps', auth, async (req, res) => {
    try {
        const swaps = await Swap.find({
            $or: [
                { requester: req.user._id },
                { recipient: req.user._id }
            ]
        })
        .populate('requester', 'name profilePhoto')
        .populate('recipient', 'name profilePhoto')
        .sort({ createdAt: -1 });

        res.json(swaps);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept a swap request
router.put('/:id/accept', auth, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);
        
        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        if (swap.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to accept this swap' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ message: 'Swap is not pending' });
        }

        swap.status = 'accepted';
        await swap.save();

        const populatedSwap = await Swap.findById(swap._id)
            .populate('requester', 'name profilePhoto')
            .populate('recipient', 'name profilePhoto');

        res.json(populatedSwap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject a swap request
router.put('/:id/reject', auth, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);
        
        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        if (swap.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to reject this swap' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ message: 'Swap is not pending' });
        }

        swap.status = 'rejected';
        await swap.save();

        const populatedSwap = await Swap.findById(swap._id)
            .populate('requester', 'name profilePhoto')
            .populate('recipient', 'name profilePhoto');

        res.json(populatedSwap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel a swap request (only by requester)
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);
        
        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        if (swap.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this swap' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ message: 'Can only cancel pending swaps' });
        }

        swap.status = 'cancelled';
        await swap.save();

        const populatedSwap = await Swap.findById(swap._id)
            .populate('requester', 'name profilePhoto')
            .populate('recipient', 'name profilePhoto');

        res.json(populatedSwap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Complete a swap
router.put('/:id/complete', auth, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);
        
        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        if (swap.status !== 'accepted') {
            return res.status(400).json({ message: 'Swap must be accepted to complete' });
        }

        if (swap.requester.toString() !== req.user._id.toString() && 
            swap.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to complete this swap' });
        }

        swap.status = 'completed';
        swap.completedAt = new Date();
        await swap.save();

        const populatedSwap = await Swap.findById(swap._id)
            .populate('requester', 'name profilePhoto')
            .populate('recipient', 'name profilePhoto');

        res.json(populatedSwap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Rate a completed swap
router.post('/:id/rate', auth, [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const swap = await Swap.findById(req.params.id);
        
        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        if (swap.status !== 'completed') {
            return res.status(400).json({ message: 'Can only rate completed swaps' });
        }

        const { rating, comment } = req.body;
        const isRequester = swap.requester.toString() === req.user._id.toString();

        if (isRequester) {
            if (swap.requesterRating.rating) {
                return res.status(400).json({ message: 'You have already rated this swap' });
            }
            swap.requesterRating = { rating, comment, date: new Date() };
        } else if (swap.recipient.toString() === req.user._id.toString()) {
            if (swap.recipientRating.rating) {
                return res.status(400).json({ message: 'You have already rated this swap' });
            }
            swap.recipientRating = { rating, comment, date: new Date() };
        } else {
            return res.status(403).json({ message: 'Not authorized to rate this swap' });
        }

        await swap.save();

        // Update user rating if both parties have rated
        if (swap.requesterRating.rating && swap.recipientRating.rating) {
            const otherUserId = isRequester ? swap.recipient : swap.requester;
            const otherUser = await User.findById(otherUserId);
            
            const totalRating = otherUser.rating * otherUser.totalRatings + rating;
            otherUser.totalRatings += 1;
            otherUser.rating = totalRating / otherUser.totalRatings;
            
            await otherUser.save();
        }

        const populatedSwap = await Swap.findById(swap._id)
            .populate('requester', 'name profilePhoto')
            .populate('recipient', 'name profilePhoto');

        res.json(populatedSwap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get swap by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id)
            .populate('requester', 'name profilePhoto')
            .populate('recipient', 'name profilePhoto');

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Check if user is part of this swap
        if (swap.requester._id.toString() !== req.user._id.toString() && 
            swap.recipient._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this swap' });
        }

        res.json(swap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 