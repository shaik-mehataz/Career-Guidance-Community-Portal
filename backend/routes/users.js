const express = require('express');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { auth } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/gridfsUpload');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedResources', 'title category createdAt')
      .select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, uploadSingle('avatar'), handleUploadError, async (req, res) => {
  try {
    const {
      fullName,
      bio,
      location,
      phone,
      skills,
      experience,
      education
    } = req.body;

    const updateData = {};
    
    if (fullName) updateData.fullName = fullName;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (phone) updateData.phone = phone;
    if (experience) updateData.experience = experience;
    if (education) updateData.education = education;
    
    // Handle skills array
    if (skills) {
      updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }

    // Handle avatar upload (stored in GridFS)
    if (req.file) {
      updateData.avatar = {
        fileId: req.file.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: `/api/files/${req.file.filename}`
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Add activity
    await user.addActivity('security', 'Profile Updated', 'Successfully updated profile information');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/save-resource/:id
// @desc    Save a resource
// @access  Private
router.post('/save-resource/:id', auth, async (req, res) => {
  try {
    const resourceId = req.params.id;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if already saved
    if (user.savedResources.includes(resourceId)) {
      return res.status(400).json({
        success: false,
        message: 'Resource already saved'
      });
    }

    // Add to saved resources
    user.savedResources.push(resourceId);
    await user.save();

    // Increment resource saves count
    await resource.incrementSaves();

    // Add activity
    await user.addActivity('save', 'Resource Saved', `Saved "${resource.title}"`, resourceId);

    res.json({
      success: true,
      message: 'Resource saved successfully'
    });
  } catch (error) {
    console.error('Save resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/save-resource/:id
// @desc    Unsave a resource
// @access  Private
router.delete('/save-resource/:id', auth, async (req, res) => {
  try {
    const resourceId = req.params.id;

    const user = await User.findById(req.user.id);
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Remove from saved resources
    user.savedResources = user.savedResources.filter(id => id.toString() !== resourceId);
    await user.save();

    // Decrement resource saves count
    await resource.decrementSaves();

    res.json({
      success: true,
      message: 'Resource unsaved successfully'
    });
  } catch (error) {
    console.error('Unsave resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/view-resource/:id
// @desc    Mark resource as viewed
// @access  Private
router.post('/view-resource/:id', auth, async (req, res) => {
  try {
    const resourceId = req.params.id;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if already viewed recently (within last hour)
    const recentView = user.viewedResources.find(
      view => view.resource.toString() === resourceId &&
      (new Date() - view.viewedAt) < 3600000 // 1 hour in milliseconds
    );

    if (!recentView) {
      // Add to viewed resources
      user.viewedResources.unshift({
        resource: resourceId,
        viewedAt: new Date()
      });

      // Keep only last 100 viewed resources
      if (user.viewedResources.length > 100) {
        user.viewedResources = user.viewedResources.slice(0, 100);
      }

      await user.save();

      // Increment resource views count
      await resource.incrementViews();

      // Add activity
      await user.addActivity('view', 'Resource Viewed', `Viewed "${resource.title}"`, resourceId);
    }

    res.json({
      success: true,
      message: 'Resource view recorded'
    });
  } catch (error) {
    console.error('View resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/activity
// @desc    Get user activity
// @access  Private
router.get('/activity', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.user.id)
      .populate({
        path: 'recentActivity.relatedId',
        select: 'title company name'
      })
      .select('recentActivity');

    const activities = user.recentActivity
      .slice((page - 1) * limit, page * limit)
      .map(activity => ({
        id: activity._id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        time: activity.timestamp.toLocaleString(),
        relatedItem: activity.relatedId
      }));

    res.json({
      success: true,
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: user.recentActivity.length,
        pages: Math.ceil(user.recentActivity.length / limit)
      }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/activity
// @desc    Add a custom activity for the user
// @access  Private
router.post('/activity', auth, async (req, res) => {
  try {
    const { type, title, description, relatedId } = req.body;
    await req.user.addActivity(type, title, description, relatedId);
    res.json({ success: true, message: 'Activity added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;