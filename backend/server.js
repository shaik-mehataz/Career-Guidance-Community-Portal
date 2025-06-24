const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection and GridFS
const connectDB = require('./config/database');
const { initGridFS } = require('./config/gridfs');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const resourceRoutes = require('./routes/resources');
const jobRoutes = require('./routes/jobs');
const eventRoutes = require('./routes/events');
const mentorRoutes = require('./routes/mentors');
const chatRoutes = require('./routes/chats');
const fileRoutes = require('./routes/files');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB and initialize GridFS
connectDB().then(() => {
  // Initialize GridFS after database connection
  setTimeout(() => {
    initGridFS();
  }, 1000);
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/files', fileRoutes); // GridFS file serving

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Career Compass API is running with GridFS file storage',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('File storage: MongoDB GridFS');
});

module.exports = app;