const mongoose = require('mongoose');
const { getGFS } = require('../config/gridfs');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Initialize GridFS
    const { initGridFS } = require('../config/gridfs');
    setTimeout(() => {
      initGridFS();
      checkApplications();
    }, 1000);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

const checkApplications = async () => {
  try {
    // Import models
    const Job = require('../models/Job');
    const JobApplication = require('../models/JobApplication');
    const User = require('../models/User');
    
    // Get all jobs
    const jobs = await Job.find({}).populate('postedBy', 'fullName email');
    console.log(`\n📋 Total jobs in database: ${jobs.length}`);
    
    if (jobs.length > 0) {
      console.log('\n💼 Jobs found:');
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   ID: ${job._id}`);
        console.log(`   Posted by: ${job.postedBy.fullName} (${job.postedBy.email})`);
        console.log(`   Status: ${job.status} | Type: ${job.type}`);
        console.log(`   Applications: ${job.applicationCount}`);
        console.log(`   Deadline: ${job.applicationDeadline.toDateString()}`);
        console.log('   ---');
      });
    }
    
    // Get all applications
    const applications = await JobApplication.find({})
      .populate('job', 'title company')
      .populate('applicant', 'fullName email');
    
    console.log(`\n📝 Total applications in database: ${applications.length}`);
    
    if (applications.length > 0) {
      console.log('\n👥 Applications found:');
      applications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.applicant.fullName} applied for ${app.job.title}`);
        console.log(`   Application ID: ${app._id}`);
        console.log(`   Company: ${app.job.company}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${app.appliedAt.toDateString()}`);
        console.log(`   Resume: ${app.resume.originalName} (${app.resume.filename})`);
        console.log(`   Experience: ${app.experience} | Education: ${app.education}`);
        if (app.coverLetter) {
          console.log(`   Cover Letter: ${app.coverLetter.substring(0, 100)}...`);
        }
        console.log('   ---');
      });
    }
    
    // Check GridFS files
    try {
      const gfs = getGFS();
      const files = await gfs.files.find({}).toArray();
      
      console.log(`\n📁 Total files in GridFS: ${files.length}`);
      
      if (files.length > 0) {
        console.log('\n📎 Files found:');
        files.forEach((file, index) => {
          console.log(`${index + 1}. ${file.filename}`);
          console.log(`   Original: ${file.metadata.originalName}`);
          console.log(`   Category: ${file.metadata.category}`);
          console.log(`   Size: ${(file.length / 1024).toFixed(2)} KB`);
          console.log(`   Type: ${file.contentType}`);
          console.log(`   Uploaded: ${file.metadata.uploadedAt}`);
          console.log(`   URL: /api/files/${file.filename}`);
          console.log('   ---');
        });
      }
      
      // Statistics
      const resumeFiles = files.filter(f => f.metadata.category === 'resumes');
      const avatarFiles = files.filter(f => f.metadata.category === 'avatars');
      const totalSize = files.reduce((sum, file) => sum + file.length, 0);
      
      console.log('\n📊 File Statistics:');
      console.log(`   Resume files: ${resumeFiles.length}`);
      console.log(`   Avatar files: ${avatarFiles.length}`);
      console.log(`   Other files: ${files.length - resumeFiles.length - avatarFiles.length}`);
      console.log(`   Total storage: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      
    } catch (gfsError) {
      console.log('\n⚠️ GridFS not initialized yet or no files found');
    }
    
    // Application statistics
    if (applications.length > 0) {
      const statusCounts = {};
      applications.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      
      console.log('\n📈 Application Statistics:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }
    
    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('Error checking applications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

connectDB();