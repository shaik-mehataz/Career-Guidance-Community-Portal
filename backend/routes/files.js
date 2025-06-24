const express = require('express');
const mongoose = require('mongoose');
const { getGFS, getGridFSBucket } = require('../config/gridfs');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/files/:filename
// @desc    Get file by filename
// @access  Public (for images) / Private (for documents)
router.get('/:filename', async (req, res) => {
  try {
    const gfs = getGFS();
    const filename = req.params.filename;

    // Find file in GridFS
    const file = await gfs.files.findOne({ filename: filename });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file is private (resumes, documents)
    const privateCategories = ['resumes', 'chat'];
    if (privateCategories.includes(file.metadata.category)) {
      // Require authentication for private files
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Authentication required.'
        });
      }
      // Additional authorization logic can be added here
    }

    // Set appropriate content type
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.metadata.originalName}"`);

    // Create read stream and pipe to response
    const gridfsBucket = getGridFSBucket();
    const downloadStream = gridfsBucket.openDownloadStreamByName(filename);
    
    downloadStream.on('error', (error) => {
      console.error('File download error:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading file'
      });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/files/:id/download
// @desc    Download file by ID
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const gfs = getGFS();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Find file in GridFS
    const file = await gfs.files.findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set headers for download
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `attachment; filename="${file.metadata.originalName}"`);

    // Create read stream and pipe to response
    const gridfsBucket = getGridFSBucket();
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    
    downloadStream.on('error', (error) => {
      console.error('File download error:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading file'
      });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete file by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const gridfsBucket = getGridFSBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Delete file from GridFS
    await gridfsBucket.delete(fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/files/user/:userId
// @desc    Get all files uploaded by a user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const gfs = getGFS();
    const userId = req.params.userId;

    // Check if user is requesting their own files or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find all files uploaded by user
    const files = await gfs.files.find({ 'metadata.uploadedBy': userId }).toArray();

    const fileList = files.map(file => ({
      id: file._id,
      filename: file.filename,
      originalName: file.metadata.originalName,
      category: file.metadata.category,
      size: file.length,
      contentType: file.contentType,
      uploadedAt: file.metadata.uploadedAt,
      url: `/api/files/${file.filename}`
    }));

    res.json({
      success: true,
      files: fileList
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;