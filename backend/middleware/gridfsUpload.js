const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');

// Create storage engine using GridFS
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Generate unique filename
      const filename = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
      
      // Determine file category based on route
      let category = 'general';
      if (req.route.path.includes('resume') || req.route.path.includes('application')) {
        category = 'resumes';
      } else if (req.route.path.includes('event')) {
        category = 'events';
      } else if (req.route.path.includes('avatar') || req.route.path.includes('profile')) {
        category = 'avatars';
      } else if (req.route.path.includes('chat') || req.route.path.includes('message')) {
        category = 'chat';
      } else if (req.route.path.includes('resource')) {
        category = 'resources';
      }

      const fileInfo = {
        filename: filename,
        bucketName: 'uploads',
        metadata: {
          originalName: file.originalname,
          category: category,
          uploadedBy: req.user ? req.user.id : null,
          uploadedAt: new Date(),
          mimetype: file.mimetype,
          size: file.size
        }
      };
      
      resolve(fileInfo);
    });
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    resume: /\.(pdf|doc|docx)$/i,
    image: /\.(jpg|jpeg|png|gif|webp)$/i,
    document: /\.(pdf|doc|docx|txt|rtf)$/i,
    general: /\.(pdf|doc|docx|txt|rtf|jpg|jpeg|png|gif|webp)$/i
  };

  let pattern = allowedTypes.general;
  
  if (file.fieldname === 'resume') {
    pattern = allowedTypes.resume;
  } else if (file.fieldname === 'image' || file.fieldname === 'avatar' || file.fieldname === 'featuredImage') {
    pattern = allowedTypes.image;
  }

  if (pattern.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${pattern.source.replace(/[\\()]/g, '').replace(/\|/g, ', ')} files are allowed.`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5
  },
  fileFilter: fileFilter
});

// Upload configurations
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
  } else if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError
};