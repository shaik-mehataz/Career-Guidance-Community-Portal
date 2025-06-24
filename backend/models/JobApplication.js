const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    enum: ['0-1', '1-3', '3-5', '5-10', '10+']
  },
  education: {
    type: String,
    required: [true, 'Education is required'],
    enum: ['High School', "Bachelor's", "Master's", 'PhD', 'Other']
  },
  coverLetter: {
    type: String,
    maxLength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired'],
    default: 'pending'
  },
  notes: {
    type: String // For employer notes
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure user can't apply to same job twice
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ appliedAt: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);