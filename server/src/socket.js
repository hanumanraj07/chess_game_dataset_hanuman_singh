const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { setupGameSockets } = require('./sockets/game.socket');
const { setupMatchmakingSockets } = require('./sockets/matchmaking.socket');

let io;

const initSocket = (server, pubClient, subClient) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust in production
      methods: ['GET', 'POST']
    }
  });

  // Defensive Redis adapter setup
  if (pubClient && subClient) {
    try {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('Socket.IO Redis Adapter configured.');
    } catch (err) {
      console.warn('Socket.IO Redis Adapter failed to initialize, falling back to Memory Adapter.');
    }
  }

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) return next(new Error('Authentication error: User not found'));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Global Connection Handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // Basic Online Presence
    socket.join('global');

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });

  setupGameSockets(io);
  setupMatchmakingSockets(io);

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.IO has not been initialized!');
  return io;
};

module.exports = { initSocket, getIo };
