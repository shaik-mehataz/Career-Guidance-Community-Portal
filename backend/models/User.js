const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'job_seeker', 'mentor', 'employer'],
    default: 'student'
  },
  avatar: {
    fileId: mongoose.Schema.Types.ObjectId,
    filename: String,
    originalName: String,
    url: String
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  location: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    enum: ['0-1', '1-3', '3-5', '5-10', '10+']
  },
  education: {
    type: String,
    enum: ['High School', "Bachelor's", "Master's", 'PhD', 'Other']
  },
  savedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  viewedResources: [{
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  recentActivity: [{
    type: {
      type: String,
      enum: ['view', 'save', 'apply', 'register', 'message', 'security'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add activity method
userSchema.methods.addActivity = function(type, title, description, relatedId = null) {
  this.recentActivity.unshift({
    type,
    title,
    description,
    relatedId,
    timestamp: new Date()
  });
  
  // Keep only last 50 activities
  if (this.recentActivity.length > 50) {
    this.recentActivity = this.recentActivity.slice(0, 50);
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);