const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
const uploadDirs = {
  resumes: path.join(__dirname, '../uploads/resumes'),
  events: path.join(__dirname, '../uploads/events'),
  resources: path.join(__dirname, '../uploads/resources'),
  avatars: path.join(__dirname, '../uploads/avatars'),
  chat: path.join(__dirname, '../uploads/chat')
};

Object.values(uploadDirs).forEach(ensureDirectoryExists);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDirs.resources; // default
    
    if (req.route.path.includes('resume') || req.route.path.includes('application')) {
      uploadPath = uploadDirs.resumes;
    } else if (req.route.path.includes('event')) {
      uploadPath = uploadDirs.events;
    } else if (req.route.path.includes('avatar') || req.route.path.includes('profile')) {
      uploadPath = uploadDirs.avatars;
    } else if (req.route.path.includes('chat') || req.route.path.includes('message')) {
      uploadPath = uploadDirs.chat;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types for different routes
  const allowedTypes = {
    resume: /\.(pdf|doc|docx)$/i,
    image: /\.(jpg|jpeg|png|gif|webp)$/i,
    document: /\.(pdf|doc|docx|txt|rtf)$/i,
    general: /\.(pdf|doc|docx|txt|rtf|jpg|jpeg|png|gif|webp)$/i
  };

  let pattern = allowedTypes.general; // default
  
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

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Specific upload configurations
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