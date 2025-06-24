const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs, gridfsBucket;

const initGridFS = () => {
  const conn = mongoose.connection;
  
  // Initialize GridFS
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  
  // Initialize GridFSBucket for newer operations
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  
  console.log('GridFS initialized successfully');
};

const getGFS = () => {
  if (!gfs) {
    throw new Error('GridFS not initialized. Call initGridFS() first.');
  }
  return gfs;
};

const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFSBucket not initialized. Call initGridFS() first.');
  }
  return gridfsBucket;
};

module.exports = {
  initGridFS,
  getGFS,
  getGridFSBucket
};