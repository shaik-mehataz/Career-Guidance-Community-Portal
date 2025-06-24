const express = require('express');
const Resource = require('../models/Resource');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateResource, validateObjectId } = require('../middleware/validation');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      targetAudience,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'published', isPublic: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (targetAudience && targetAudience !== 'all') {
      query.targetAudience = { $in: [targetAudience] };
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const resources = await Resource.find(query)
      .populate('author', 'fullName avatar')
      .select('-content') // Exclude full content from list view
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments(query);

    // Mark saved resources for authenticated users
    if (req.user) {
      resources.forEach(resource => {
        resource.isSaved = req.user.savedResources.includes(resource._id);
      });
    }

    res.json({
      success: true,
      resources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/resources/categories
// @desc    Get all resource categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Resource.distinct('category', { status: 'published' });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/resources/recommended/:userType
// @desc    Get recommended resources for user type
// @access  Public
router.get('/recommended/:userType', async (req, res) => {
  try {
    const { userType } = req.params;
    const { limit = 6 } = req.query;

    const resources = await Resource.find({
      status: 'published',
      isPublic: true,
      targetAudience: { $in: [userType] }
    })
    .populate('author', 'fullName avatar')
    .select('-content')
    .sort({ views: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Get recommended resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('author', 'fullName avatar bio')
      .populate('attachments');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.status !== 'published' || !resource.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Mark as saved for authenticated users
    if (req.user) {
      resource.isSaved = req.user.savedResources.includes(resource._id);
    }

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/resources/:id/related
// @desc    Get related resources
// @access  Public
router.get('/:id/related', validateObjectId('id'), async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Find related resources based on category and tags
    const relatedResources = await Resource.find({
      _id: { $ne: req.params.id },
      status: 'published',
      isPublic: true,
      $or: [
        { category: resource.category },
        { tags: { $in: resource.tags } }
      ]
    })
    .populate('author', 'fullName avatar')
    .select('-content')
    .sort({ views: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      resources: relatedResources
    });
  } catch (error) {
    console.error('Get related resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/resources
// @desc    Create new resource
// @access  Private (Admin/Content Creator)
router.post('/', auth, uploadMultiple('attachments'), handleUploadError, validateResource, async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      targetAudience,
      difficulty,
      readTime,
      tags,
      status = 'published'
    } = req.body;

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

    const resource = new Resource({
      title,
      description,
      content,
      category,
      targetAudience: Array.isArray(targetAudience) ? targetAudience : [targetAudience],
      difficulty,
      readTime: parseInt(readTime),
      tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()),
      author: req.user.id,
      attachments,
      status
    });

    await resource.save();

    // Add activity
    await req.user.addActivity('create', 'Resource Created', `Created "${resource.title}"`, resource._id);

    await resource.populate('author', 'fullName avatar');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Private (Author/Admin)
router.put('/:id', auth, validateObjectId('id'), uploadMultiple('attachments'), handleUploadError, validateResource, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check ownership
    if (resource.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }

    const {
      title,
      description,
      content,
      category,
      targetAudience,
      difficulty,
      readTime,
      tags,
      status
    } = req.body;

    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (content) resource.content = content;
    if (category) resource.category = category;
    if (targetAudience) resource.targetAudience = Array.isArray(targetAudience) ? targetAudience : [targetAudience];
    if (difficulty) resource.difficulty = difficulty;
    if (readTime) resource.readTime = parseInt(readTime);
    if (tags) resource.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (status) resource.status = status;

    // Handle new attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
      resource.attachments.push(...newAttachments);
    }

    await resource.save();
    await resource.populate('author', 'fullName avatar');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private (Author/Admin)
router.delete('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check ownership
    if (resource.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;