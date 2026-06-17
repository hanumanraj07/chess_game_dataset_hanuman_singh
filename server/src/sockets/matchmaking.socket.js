const { getCache, setCache, redisClient } = require('../utils/cache');
const { v4: uuidv4 } = require('uuid');

const setupMatchmakingSockets = (io) => {
  const mmNamespace = io.of('/matchmaking');

  mmNamespace.on('connection', (socket) => {
    socket.on('join_queue', async ({ mode, rating }) => {
      if (!redisClient) {
        socket.emit('queue_error', { message: 'Matchmaking is currently unavailable' });
        return;
      }
      
      const queueKey = `queue:${mode}`;
      
      // Add user to Redis Sorted Set with their rating as the score
      await redisClient.zAdd(queueKey, { score: rating, value: socket.user._id.toString() });
      socket.join(queueKey);

      socket.emit('queue_joined', { mode });

      // Trigger matchmaking check
      matchPlayers(mmNamespace, queueKey);
    });

    socket.on('leave_queue', async ({ mode }) => {
      if (!redisClient) return;
      const queueKey = `queue:${mode}`;
      await redisClient.zRem(queueKey, socket.user._id.toString());
      socket.leave(queueKey);
      socket.emit('queue_left');
    });

    socket.on('disconnect', async () => {
      if (!redisClient) return;
      // In a real app, track which queue they were in. Here we'll do a basic cleanup
      await redisClient.zRem('queue:blitz', socket.user._id.toString());
      await redisClient.zRem('queue:bullet', socket.user._id.toString());
      await redisClient.zRem('queue:rapid', socket.user._id.toString());
    });
  });
};

const matchPlayers = async (mmNamespace, queueKey) => {
  if (!redisClient) return;
  
  // Get all players in queue sorted by rating
  const players = await redisClient.zRangeWithScores(queueKey, 0, -1);
  
  // Simple matchmaking: pair adjacent players if rating delta < 100
  for (let i = 0; i < players.length - 1; i++) {
    const p1 = players[i];
    const p2 = players[i + 1];

    if (Math.abs(p1.score - p2.score) <= 100) {
      // Match found!
      const roomId = uuidv4();
      
      // Remove them from queue
      await redisClient.zRem(queueKey, p1.value);
      await redisClient.zRem(queueKey, p2.value);

      // Notify them
      mmNamespace.emit('match_found', {
        roomId,
        players: [p1.value, p2.value]
      });

      // Skip the matched player
      i++;
    }
  }
};

module.exports = { setupMatchmakingSockets };
