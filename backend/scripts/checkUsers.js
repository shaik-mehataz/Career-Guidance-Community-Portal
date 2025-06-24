const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Import User model
    const User = require('../models/User');
    
    // Find all users
    const users = await User.find({});
    console.log('\n📊 Total users in database:', users.length);
    
    if (users.length > 0) {
      console.log('\n👥 Users found:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email}) - Role: ${user.role}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Active: ${user.isActive}`);
        console.log('   ---');
      });
    } else {
      console.log('\n❌ No users found in database');
    }
    
    // Check specific user
    const specificUser = await User.findOne({ email: 'mehataz@gmail.com' });
    if (specificUser) {
      console.log('\n✅ Found user mehataz@gmail.com:');
      console.log('   Full Name:', specificUser.fullName);
      console.log('   Role:', specificUser.role);
      console.log('   Created:', specificUser.createdAt);
      console.log('   Last Login:', specificUser.lastLogin);
    } else {
      console.log('\n❌ User mehataz@gmail.com not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

connectDB();