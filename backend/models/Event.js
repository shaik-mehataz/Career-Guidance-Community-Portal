const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  organizer: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  locationType: {
    type: String,
    enum: ['In-person', 'Virtual', 'Hybrid'],
    required: [true, 'Location type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Workshop',
      'Seminar',
      'Conference',
      'Networking',
      'Career Fair',
      'Webinar',
      'Panel Discussion',
      'Training',
      'Meetup',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featuredImage: {
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
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }],
  speakers: [{
    name: String,
    title: String,
    bio: String,
    image: String
  }],
  requirements: [String],
  benefits: [String],
  registrationCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ registrationDeadline: 1 });

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date();
});

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  return new Date() < this.registrationDeadline && this.status === 'published';
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.capacity && this.registrationCount >= this.capacity;
});

// Increment views
eventSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Increment registration count
eventSchema.methods.incrementRegistrations = function() {
  this.registrationCount += 1;
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);