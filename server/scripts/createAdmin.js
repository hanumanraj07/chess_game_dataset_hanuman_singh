const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ email: 'admin@chess.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@chess.com',
        password: 'password', // will be hashed by pre-save hook
        role: 'admin',
        isEmailVerified: true
      });
      console.log('Admin account created!');
    } else {
      admin.role = 'admin';
      admin.password = 'password';
      await admin.save();
      console.log('Admin account updated!');
    }
    console.log('Email: admin@chess.com');
    console.log('Password: password');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
