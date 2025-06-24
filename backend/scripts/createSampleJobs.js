const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Import models
    const Job = require('../models/Job');
    const User = require('../models/User');
    
    // Find a user to be the job poster (or create one)
    let jobPoster = await User.findOne({ role: 'employer' });
    
    if (!jobPoster) {
      // Create a sample employer if none exists
      jobPoster = new User({
        fullName: 'TechCorp HR Team',
        email: 'hr@techcorp.com',
        password: 'password123',
        role: 'employer'
      });
      await jobPoster.save();
      console.log('✅ Created sample employer user');
    }
    
    // Clear existing sample jobs
    await Job.deleteMany({ company: { $in: ['TechCorp Solutions', 'InnovateTech', 'StartupHub', 'DigitalCraft'] } });
    console.log('🗑️ Cleared existing sample jobs');
    
    // Sample jobs data
    const sampleJobs = [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Solutions',
        description: 'We are looking for an experienced Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining high-quality software applications using modern technologies.',
        requirements: [
          '5+ years of experience in software development',
          'Proficiency in JavaScript, React, Node.js',
          'Experience with databases (MongoDB, PostgreSQL)',
          'Knowledge of cloud platforms (AWS, Azure)',
          'Strong problem-solving skills',
          'Excellent communication skills'
        ],
        responsibilities: [
          'Design and develop scalable web applications',
          'Collaborate with cross-functional teams',
          'Code review and mentoring junior developers',
          'Participate in architectural decisions',
          'Ensure code quality and best practices'
        ],
        location: 'Bangalore, Karnataka',
        locationType: 'Hybrid',
        type: 'Full-time',
        experience: '5-10 years',
        salary: {
          min: 1200000,
          max: 2000000,
          currency: 'INR',
          period: 'yearly'
        },
        category: 'Technology',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Git', 'Docker'],
        benefits: [
          'Health insurance',
          'Flexible working hours',
          'Professional development budget',
          'Stock options',
          'Free meals'
        ],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        postedBy: jobPoster._id,
        isRemote: false
      },
      {
        title: 'Frontend Developer Intern',
        company: 'InnovateTech',
        description: 'Join our team as a Frontend Developer Intern and gain hands-on experience building modern web applications. This is a great opportunity for students or recent graduates to kickstart their career in tech.',
        requirements: [
          'Currently pursuing or recently completed degree in Computer Science',
          'Basic knowledge of HTML, CSS, JavaScript',
          'Familiarity with React or Vue.js',
          'Understanding of responsive design',
          'Eagerness to learn and grow'
        ],
        responsibilities: [
          'Assist in developing user interfaces',
          'Work on responsive web design',
          'Participate in code reviews',
          'Learn from senior developers',
          'Contribute to team projects'
        ],
        location: 'Mumbai, Maharashtra',
        locationType: 'On-site',
        type: 'Internship',
        experience: 'Entry Level',
        salary: {
          min: 15000,
          max: 25000,
          currency: 'INR',
          period: 'monthly'
        },
        category: 'Technology',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
        benefits: [
          'Mentorship program',
          'Learning opportunities',
          'Certificate of completion',
          'Potential for full-time offer'
        ],
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: 'active',
        postedBy: jobPoster._id,
        isRemote: false
      },
      {
        title: 'Digital Marketing Specialist',
        company: 'StartupHub',
        description: 'We are seeking a creative and data-driven Digital Marketing Specialist to help grow our online presence and drive customer acquisition through various digital channels.',
        requirements: [
          '2-4 years of digital marketing experience',
          'Experience with Google Ads, Facebook Ads',
          'Knowledge of SEO and content marketing',
          'Analytics tools experience (Google Analytics)',
          'Strong written communication skills',
          'Creative thinking and problem-solving'
        ],
        responsibilities: [
          'Develop and execute digital marketing campaigns',
          'Manage social media accounts',
          'Create engaging content for various platforms',
          'Analyze campaign performance and optimize',
          'Collaborate with design and content teams'
        ],
        location: 'Delhi, NCR',
        locationType: 'Remote',
        type: 'Full-time',
        experience: '1-3 years',
        salary: {
          min: 400000,
          max: 700000,
          currency: 'INR',
          period: 'yearly'
        },
        category: 'Marketing',
        skills: ['Digital Marketing', 'Google Ads', 'SEO', 'Social Media', 'Analytics', 'Content Creation'],
        benefits: [
          'Remote work flexibility',
          'Performance bonuses',
          'Professional development',
          'Health insurance'
        ],
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        status: 'active',
        postedBy: jobPoster._id,
        isRemote: true
      },
      {
        title: 'UX/UI Designer',
        company: 'DigitalCraft',
        description: 'Join our design team as a UX/UI Designer and help create intuitive and beautiful user experiences for our digital products. You will work closely with product managers and developers.',
        requirements: [
          '3+ years of UX/UI design experience',
          'Proficiency in Figma, Sketch, or Adobe XD',
          'Strong portfolio showcasing design process',
          'Understanding of user-centered design principles',
          'Experience with prototyping tools',
          'Knowledge of HTML/CSS is a plus'
        ],
        responsibilities: [
          'Create wireframes, prototypes, and high-fidelity designs',
          'Conduct user research and usability testing',
          'Collaborate with product and engineering teams',
          'Maintain design systems and style guides',
          'Present design concepts to stakeholders'
        ],
        location: 'Pune, Maharashtra',
        locationType: 'Hybrid',
        type: 'Full-time',
        experience: '3-5 years',
        salary: {
          min: 800000,
          max: 1400000,
          currency: 'INR',
          period: 'yearly'
        },
        category: 'Design',
        skills: ['UX Design', 'UI Design', 'Figma', 'Prototyping', 'User Research', 'Design Systems'],
        benefits: [
          'Creative freedom',
          'Latest design tools',
          'Conference attendance',
          'Flexible hours',
          'Health insurance'
        ],
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        status: 'active',
        postedBy: jobPoster._id,
        isRemote: false
      }
    ];
    
    // Create jobs
    const createdJobs = await Job.insertMany(sampleJobs);
    console.log(`✅ Created ${createdJobs.length} sample jobs:`);
    
    createdJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company}`);
      console.log(`   ID: ${job._id}`);
      console.log(`   Type: ${job.type} | Experience: ${job.experience}`);
      console.log(`   Location: ${job.location} (${job.locationType})`);
      console.log(`   Deadline: ${job.applicationDeadline.toDateString()}`);
      console.log('   ---');
    });
    
    console.log('\n🎯 Sample jobs created successfully!');
    console.log('You can now test job applications with these jobs.');
    
  } catch (error) {
    console.error('Error creating sample jobs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

connectDB();