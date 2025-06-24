const express = require('express');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateJob, validateObjectId } = require('../middleware/validation');
const { uploadSingle, handleUploadError } = require('../middleware/gridfsUpload');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      type,
      location,
      experience,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'active', applicationDeadline: { $gte: new Date() } };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (experience && experience !== 'all') {
      query.experience = experience;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const jobs = await Job.find(query)
      .populate('postedBy', 'fullName company')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    // Check if user has applied to these jobs
    if (req.user) {
      const jobIds = jobs.map(job => job._id);
      const applications = await JobApplication.find({
        job: { $in: jobIds },
        applicant: req.user.id
      }).select('job');

      const appliedJobIds = applications.map(app => app.job.toString());

      jobs.forEach(job => {
        job.hasApplied = appliedJobIds.includes(job._id.toString());
      });
    }

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'fullName company avatar');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment views
    await job.incrementViews();

    // Check if user has applied
    if (req.user) {
      const application = await JobApplication.findOne({
        job: job._id,
        applicant: req.user.id
      });
      job.hasApplied = !!application;
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private
router.post('/:id/apply', auth, validateObjectId('id'), uploadSingle('resume'), handleUploadError, async (req, res) => {
  try {
    console.log('Job application attempt:', {
      jobId: req.params.id,
      userId: req.user.id,
      body: req.body,
      file: req.file ? { filename: req.file.filename, size: req.file.size } : null
    });

    const { name, email, phone, experience, education, coverLetter } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !experience || !education) {
      console.log('Missing required fields:', { name: !!name, email: !!email, phone: !!phone, experience: !!experience, education: !!education });
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    if (!req.file) {
      console.log('No resume file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      console.log('Job not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      console.log('Job not active:', job.status);
      return res.status(400).json({
        success: false,
        message: 'Job is not active for applications'
      });
    }

    if (new Date() > job.applicationDeadline) {
      console.log('Application deadline passed:', job.applicationDeadline);
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user has already applied
    const existingApplication = await JobApplication.findOne({
      job: req.params.id,
      applicant: req.user.id
    });

    if (existingApplication) {
      console.log('User already applied:', req.user.id);
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application with GridFS file data
    const application = new JobApplication({
      job: req.params.id,
      applicant: req.user.id,
      name,
      email,
      phone,
      experience,
      education,
      coverLetter,
      resume: {
        fileId: req.file.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/api/files/${req.file.filename}`
      }
    });

    await application.save();
    console.log('Application created successfully:', application._id);

    // Increment job application count
    await job.incrementApplications();

    // Add activity
    try {
      await req.user.addActivity('apply', 'Job Application', `Applied for ${job.title} at ${job.company}`, job._id);
    } catch (activityError) {
      console.log('Activity logging failed:', activityError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        status: application.status,
        appliedAt: application.appliedAt,
        resume: {
          filename: application.resume.filename,
          originalName: application.resume.originalName,
          url: application.resume.url
        }
      }
    });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// @route   GET /api/jobs/:id/check-application
// @desc    Check if user has applied for a job
// @access  Private
router.get('/:id/check-application', auth, validateObjectId('id'), async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      job: req.params.id,
      applicant: req.user.id
    }).select('status appliedAt');

    res.json({
      success: true,
      hasApplied: !!application,
      application
    });
  } catch (error) {
    console.error('Check application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs/user/applications
// @desc    Get user's job applications
// @access  Private
router.get('/user/applications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { applicant: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await JobApplication.find(query)
      .populate('job', 'title company location type applicationDeadline')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private (Employers)
router.post('/', auth, validateJob, async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      responsibilities,
      location,
      locationType,
      type,
      experience,
      salary,
      category,
      skills,
      benefits,
      applicationDeadline,
      applicationUrl
    } = req.body;

    const job = new Job({
      title,
      company,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [responsibilities],
      location,
      locationType,
      type,
      experience,
      salary,
      category,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
      benefits: Array.isArray(benefits) ? benefits : [benefits],
      applicationDeadline: new Date(applicationDeadline),
      applicationUrl,
      postedBy: req.user.id
    });

    await job.save();
    await job.populate('postedBy', 'fullName company');

    // Add activity
    try {
      await req.user.addActivity('create', 'Job Posted', `Posted job: ${job.title}`, job._id);
    } catch (activityError) {
      console.log('Activity logging failed:', activityError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs/:id/applications
// @desc    Get job applications (for job poster)
// @access  Private
router.get('/:id/applications', auth, validateObjectId('id'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications'
      });
    }

    const { page = 1, limit = 20, status } = req.query;

    const query = { job: req.params.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await JobApplication.find(query)
      .populate('applicant', 'fullName email avatar')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;