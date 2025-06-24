const express = require('express');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateEvent, validateObjectId } = require('../middleware/validation');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      locationType,
      search,
      upcoming = 'true',
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { status: 'published', isPublic: true };

    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (locationType && locationType !== 'all') {
      query.locationType = locationType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const events = await Event.find(query)
      .populate('hostId', 'fullName avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    // Check if user has registered for these events
    if (req.user) {
      const eventIds = events.map(event => event._id);
      const registrations = await EventRegistration.find({
        event: { $in: eventIds },
        user: req.user.id
      }).select('event');

      const registeredEventIds = registrations.map(reg => reg.event.toString());

      events.forEach(event => {
        event.isRegistered = registeredEventIds.includes(event._id.toString());
      });
    }

    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/events/upcoming
// @desc    Get upcoming events (limited)
// @access  Public
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const events = await Event.find({
      status: 'published',
      isPublic: true,
      startDate: { $gte: new Date() }
    })
    .populate('hostId', 'fullName avatar')
    .sort({ startDate: 1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('hostId', 'fullName avatar bio');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'published' || !event.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment views
    await event.incrementViews();

    // Check if user has registered
    if (req.user) {
      const registration = await EventRegistration.findOne({
        event: event._id,
        user: req.user.id
      });
      event.isRegistered = !!registration;
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', auth, uploadSingle('featuredImage'), handleUploadError, validateEvent, async (req, res) => {
  try {
    const {
      title,
      description,
      organizer,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      locationType,
      category,
      tags,
      price = 0,
      capacity,
      registrationDeadline,
      agenda,
      speakers,
      requirements,
      benefits
    } = req.body;

    const eventData = {
      title,
      description,
      organizer,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      location,
      locationType,
      category,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()),
      price: parseFloat(price),
      registrationDeadline: new Date(registrationDeadline),
      hostId: req.user.id
    };

    if (capacity) eventData.capacity = parseInt(capacity);
    if (agenda) eventData.agenda = JSON.parse(agenda);
    if (speakers) eventData.speakers = JSON.parse(speakers);
    if (requirements) eventData.requirements = Array.isArray(requirements) ? requirements : [requirements];
    if (benefits) eventData.benefits = Array.isArray(benefits) ? benefits : [benefits];

    // Handle featured image
    if (req.file) {
      eventData.featuredImage = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    const event = new Event(eventData);
    await event.save();

    await event.populate('hostId', 'fullName avatar');

    // Add activity
    await req.user.addActivity('create', 'Event Created', `Created event: ${event.title}`, event._id);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, validateObjectId('id'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      organization,
      designation,
      dietary_preferences,
      special_requirements
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for registration'
      });
    }

    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    if (event.capacity && event.registrationCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if user has already registered
    const existingRegistration = await EventRegistration.findOne({
      event: req.params.id,
      user: req.user.id
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event'
      });
    }

    // Create registration
    const registration = new EventRegistration({
      event: req.params.id,
      user: req.user.id,
      name,
      email,
      phone,
      organization,
      designation,
      dietary_preferences,
      special_requirements
    });

    await registration.save();

    // Increment event registration count
    await event.incrementRegistrations();

    // Add activity
    await req.user.addActivity('register', 'Event Registration', `Registered for ${event.title}`, event._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registration: {
        id: registration._id,
        status: registration.status,
        registeredAt: registration.registeredAt
      }
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/events/:id/check-registration
// @desc    Check if user has registered for an event
// @access  Private
router.get('/:id/check-registration', auth, validateObjectId('id'), async (req, res) => {
  try {
    const registration = await EventRegistration.findOne({
      event: req.params.id,
      user: req.user.id
    }).select('status registeredAt');

    res.json({
      success: true,
      isRegistered: !!registration,
      registration
    });
  } catch (error) {
    console.error('Check registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/events/user/registrations
// @desc    Get user's event registrations
// @access  Private
router.get('/user/registrations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const registrations = await EventRegistration.find(query)
      .populate('event', 'title organizer startDate location locationType')
      .sort({ registeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EventRegistration.countDocuments(query);

    res.json({
      success: true,
      registrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/events/user/hosted
// @desc    Get events hosted by user
// @access  Private
router.get('/user/hosted', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const events = await Event.find({ hostId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments({ hostId: req.user.id });

    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get hosted events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/events/:id/registrations
// @desc    Get event registrations (for event host)
// @access  Private
router.get('/:id/registrations', auth, validateObjectId('id'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the event host
    if (event.hostId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations'
      });
    }

    const { page = 1, limit = 20, status } = req.query;

    const query = { event: req.params.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const registrations = await EventRegistration.find(query)
      .populate('user', 'fullName email avatar')
      .sort({ registeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EventRegistration.countDocuments(query);

    res.json({
      success: true,
      registrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;