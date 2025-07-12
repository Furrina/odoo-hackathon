const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Get all public users (for browsing)
router.get('/browse', async (req, res) => {
  try {
    const { skill, location, availability } = req.query;
    let query = { isPublic: true, isBanned: false };

    if (skill) {
      query.skillsOffered = { $regex: skill, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Availability filter (can be array or string)
    if (availability) {
      const availArr = Array.isArray(availability) ? availability : [availability];
      query.$or = availArr.map(a => ({ [`availability.${a}`]: true }));
    }

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;
    let total = await User.countDocuments(query);
    let users = await User.find(query)
      .select('name location skillsOffered skillsWanted availability rating profilePhoto')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit);

    // If logged in, filter users to only those who can accept a request from the current user
    if (req.user && req.user.skillsOffered && req.user.skillsOffered.length > 0) {
      users = users.filter(u => {
        if (!u.skillsWanted || u._id.toString() === req.user._id.toString()) return false;
        // Intersection between my offered and their wanted
        return u.skillsWanted.some(skill => req.user.skillsOffered.includes(skill));
      });
    }

    // If searching by skill, exclude users who want the same skill as the current user (if the current user also wants it)
    if (skill && req.user && req.user.skillsWanted && req.user.skillsWanted.includes(skill)) {
      users = users.filter(u => !(u.skillsWanted && u.skillsWanted.includes(skill)));
    }

    res.json({ users, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if profile is private and user is not viewing their own profile
    if (!user.isPublic && req.user?._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('location').optional().trim(),
  body('skillsOffered').optional().isArray().withMessage('Skills offered must be an array'),
  body('skillsWanted').optional().isArray().withMessage('Skills wanted must be an array'),
  body('availability').optional().isObject().withMessage('Availability must be an object'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateFields = {};
    const allowedFields = ['name', 'location', 'skillsOffered', 'skillsWanted', 'availability', 'isPublic'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add skill to offered skills
router.post('/skills-offered', auth, [
  body('skill').trim().notEmpty().withMessage('Skill is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skill } = req.body;
    const user = await User.findById(req.user._id);

    if (user.skillsOffered.includes(skill)) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    user.skillsOffered.push(skill);
    await user.save();

    res.json(user.skillsOffered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove skill from offered skills
router.delete('/skills-offered/:skill', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skillsOffered = user.skillsOffered.filter(skill => skill !== req.params.skill);
    await user.save();

    res.json(user.skillsOffered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add skill to wanted skills
router.post('/skills-wanted', auth, [
  body('skill').trim().notEmpty().withMessage('Skill is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skill } = req.body;
    const user = await User.findById(req.user._id);

    if (user.skillsWanted.includes(skill)) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    user.skillsWanted.push(skill);
    await user.save();

    res.json(user.skillsWanted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove skill from wanted skills
router.delete('/skills-wanted/:skill', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skillsWanted = user.skillsWanted.filter(skill => skill !== req.params.skill);
    await user.save();

    res.json(user.skillsWanted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User: Set or update a skill description
router.post('/skills-offered/:skill/description', auth, async (req, res) => {
  try {
    const { description } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.skillsOffered.includes(req.params.skill)) {
      return res.status(400).json({ message: 'You do not offer this skill' });
    }
    user.skillDescriptions.set(req.params.skill, description);
    await user.save();
    res.json({ skill: req.params.skill, description });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Remove a skill description (reject inappropriate)
router.delete('/skills-offered/:userId/:skill/description', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.skillDescriptions.delete(req.params.skill);
    await user.save();
    res.json({ message: 'Skill description removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all skill descriptions for moderation
router.get('/skills/descriptions', adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    const descriptions = [];
    users.forEach(user => {
      user.skillsOffered.forEach(skill => {
        const desc = user.skillDescriptions.get(skill);
        if (desc) {
          descriptions.push({ userId: user._id, userName: user.name, skill, description: desc });
        }
      });
    });
    res.json(descriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 