const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxLength: [100, 'Company name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [String],
  responsibilities: [String],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  locationType: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid'],
    default: 'On-site'
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    required: [true, 'Job type is required']
  },
  experience: {
    type: String,
    enum: ['Entry Level', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    required: [true, 'Experience level is required']
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  category: {
    type: String,
    required: [true, 'Job category is required'],
    enum: [
      'Technology',
      'Marketing',
      'Sales',
      'Design',
      'Finance',
      'Operations',
      'Human Resources',
      'Customer Service',
      'Healthcare',
      'Education',
      'Engineering',
      'Legal',
      'Other'
    ]
  },
  skills: [{
    type: String,
    trim: true
  }],
  benefits: [String],
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyLogo: {
    type: String,
    default: null
  },
  applicationUrl: {
    type: String,
    trim: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ experience: 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ createdAt: -1 });

// Check if application deadline has passed
jobSchema.virtual('isExpired').get(function() {
  return new Date() > this.applicationDeadline;
});

// Increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Increment application count
jobSchema.methods.incrementApplications = function() {
  this.applicationCount += 1;
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);