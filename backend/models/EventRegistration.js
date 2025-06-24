const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
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
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  dietary_preferences: {
    type: String,
    trim: true
  },
  special_requirements: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled', 'no-show'],
    default: 'registered'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  checkedInAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to ensure user can't register for same event twice
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });
eventRegistrationSchema.index({ status: 1 });
eventRegistrationSchema.index({ registeredAt: -1 });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);