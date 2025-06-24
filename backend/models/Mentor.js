const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  expertise: [{
    type: String,
    required: [true, 'At least one expertise area is required'],
    trim: true
  }],
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    enum: ['1-3 years', '3-5 years', '5-10 years', '10+ years']
  },
  industry: [{
    type: String,
    required: [true, 'At least one industry is required'],
    enum: [
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'Marketing',
      'Sales',
      'Design',
      'Engineering',
      'Consulting',
      'Entrepreneurship',
      'Non-profit',
      'Government',
      'Other'
    ]
  }],
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    maxLength: [1000, 'Bio cannot exceed 1000 characters']
  },
  currentRole: {
    type: String,
    required: [true, 'Current role is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  education: [{
    degree: String,
    institution: String,
    year: Number,
    field: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    url: String
  }],
  languages: [{
    type: String,
    enum: ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Other']
  }],
  availability: {
    weekdays: {
      type: Boolean,
      default: true
    },
    weekends: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    preferredHours: {
      start: String,
      end: String
    }
  },
  sessionTypes: [{
    type: String,
    enum: ['One-on-one', 'Group', 'Workshop', 'Q&A Session'],
    default: 'One-on-one'
  }],
  pricing: {
    currency: {
      type: String,
      default: 'INR'
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Rate cannot be negative']
    },
    isFree: {
      type: Boolean,
      default: false
    }
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
mentorSchema.index({ expertise: 1 });
mentorSchema.index({ industry: 1 });
mentorSchema.index({ 'rating.average': -1 });
mentorSchema.index({ isActive: 1, isVerified: 1 });

// Update session count
mentorSchema.methods.incrementSessions = function() {
  this.totalSessions += 1;
  return this.save();
};

module.exports = mongoose.model('Mentor', mentorSchema);