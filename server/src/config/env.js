require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Simple validation
Object.entries(env).forEach(([key, value]) => {
  if (!value && key !== 'PORT') {
    console.warn(`Warning: Environment variable ${key} is missing.`);
  }
});

module.exports = env;
