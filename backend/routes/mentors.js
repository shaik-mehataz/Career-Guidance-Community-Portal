const express = require('express');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateMentor, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/mentors
// @desc    Get all mentors with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      expertise,
      industry,
      experience,
      search,
      sortBy = 'rating.average',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true, isVerified: true };

    if (expertise && expertise !== 'all') {
      query.expertise = { $in: [expertise] };
    }

    if (industry && industry !== 'all') {
      query.industry = { $in: [industry] };
    }

    if (experience && experience !== 'all') {
      query.experience = experience;
    }

    if (search) {
      query.$or = [
        { expertise: { $in: [new RegExp(search, 'i')] } },
        { bio: { $regex: search, $options: 'i' } },
        { currentRole: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const mentors = await Mentor.find(query)
      .populate('user', 'fullName avatar email location')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Mentor.countDocuments(query);

    res.json({
      success: true,
      mentors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/mentors/:id
// @desc    Get single mentor
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('user', 'fullName avatar email location bio skills');

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    if (!mentor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    res.json({
      success: true,
      mentor
    });
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/mentors
// @desc    Create mentor profile
// @access  Private
router.post('/', auth, validateMentor, async (req, res) => {
  try {
    // Check if user already has a mentor profile
    const existingMentor = await Mentor.findOne({ user: req.user.id });
    if (existingMentor) {
      return res.status(400).json({
        success: false,
        message: 'Mentor profile already exists'
      });
    }

    const {
      expertise,
      experience,
      industry,
      bio,
      currentRole,
      company,
      education,
      certifications,
      languages,
      availability,
      sessionTypes,
      pricing,
      socialLinks
    } = req.body;

    const mentor = new Mentor({
      user: req.user.id,
      expertise: Array.isArray(expertise) ? expertise : [expertise],
      experience,
      industry: Array.isArray(industry) ? industry : [industry],
      bio,
      currentRole,
      company,
      education: education ? JSON.parse(education) : [],
      certifications: certifications ? JSON.parse(certifications) : [],
      languages: Array.isArray(languages) ? languages : [languages],
      availability: availability ? JSON.parse(availability) : {},
      sessionTypes: Array.isArray(sessionTypes) ? sessionTypes : [sessionTypes],
      pricing: pricing ? JSON.parse(pricing) : {},
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {}
    });

    await mentor.save();
    await mentor.populate('user', 'fullName avatar email location');

    // Add activity
    await req.user.addActivity('create', 'Mentor Profile Created', 'Successfully created mentor profile', mentor._id);

    res.status(201).json({
      success: true,
      message: 'Mentor profile created successfully',
      mentor
    });
  } catch (error) {
    console.error('Create mentor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/mentors/:id
// @desc    Update mentor profile
// @access  Private
router.put('/:id', auth, validateObjectId('id'), validateMentor, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    // Check ownership
    if (mentor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const {
      expertise,
      experience,
      industry,
      bio,
      currentRole,
      company,
      education,
      certifications,
      languages,
      availability,
      sessionTypes,
      pricing,
      socialLinks
    } = req.body;

    // Update fields
    if (expertise) mentor.expertise = Array.isArray(expertise) ? expertise : [expertise];
    if (experience) mentor.experience = experience;
    if (industry) mentor.industry = Array.isArray(industry) ? industry : [industry];
    if (bio) mentor.bio = bio;
    if (currentRole) mentor.currentRole = currentRole;
    if (company) mentor.company = company;
    if (education) mentor.education = JSON.parse(education);
    if (certifications) mentor.certifications = JSON.parse(certifications);
    if (languages) mentor.languages = Array.isArray(languages) ? languages : [languages];
    if (availability) mentor.availability = JSON.parse(availability);
    if (sessionTypes) mentor.sessionTypes = Array.isArray(sessionTypes) ? sessionTypes : [sessionTypes];
    if (pricing) mentor.pricing = JSON.parse(pricing);
    if (socialLinks) mentor.socialLinks = JSON.parse(socialLinks);

    await mentor.save();
    await mentor.populate('user', 'fullName avatar email location');

    res.json({
      success: true,
      message: 'Mentor profile updated successfully',
      mentor
    });
  } catch (error) {
    console.error('Update mentor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;