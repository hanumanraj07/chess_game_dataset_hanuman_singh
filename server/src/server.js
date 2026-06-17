require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis, redisClient, subClient } = require('./utils/cache');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Connect to Database
connectDB();
connectRedis().then(() => {
  // Initialize Socket.IO after Redis connects (or fails over)
  initSocket(server, redisClient, subClient);
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
