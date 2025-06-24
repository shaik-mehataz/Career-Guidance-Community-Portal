const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Resume Building',
      'Interview Preparation',
      'Career Planning',
      'Skill Development',
      'Industry Insights',
      'Networking',
      'Job Search',
      'Freelancing',
      'Entrepreneurship',
      'Personal Branding'
    ]
  },
  targetAudience: [{
    type: String,
    enum: ['student', 'job_seeker', 'mentor', 'employer']
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  readTime: {
    type: Number, // in minutes
    required: [true, 'Read time is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  featuredImage: {
    fileId: mongoose.Schema.Types.ObjectId,
    filename: String,
    originalName: String,
    url: String
  },
  attachments: [{
    fileId: mongoose.Schema.Types.ObjectId,
    filename: String,
    originalName: String,
    size: Number,
    contentType: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ targetAudience: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ createdAt: -1 });

// Update views count
resourceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Update saves count
resourceSchema.methods.incrementSaves = function() {
  this.saves += 1;
  return this.save();
};

resourceSchema.methods.decrementSaves = function() {
  this.saves = Math.max(0, this.saves - 1);
  return this.save();
};

module.exports = mongoose.model('Resource', resourceSchema);