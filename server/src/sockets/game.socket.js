const { Chess } = require('chess.js');
const Match = require('../models/Match');
const User = require('../models/User');

// In-memory active games
const activeGames = new Map();

// Basic Elo Calculator
const calculateElo = (r1, r2, result) => {
  const k = 32;
  const expected1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));
  
  let score1 = 0.5, score2 = 0.5; // draw
  if (result === 'white') { score1 = 1; score2 = 0; }
  else if (result === 'black') { score1 = 0; score2 = 1; }
  
  return {
    newR1: Math.round(r1 + k * (score1 - expected1)),
    newR2: Math.round(r2 + k * (score2 - expected2))
  };
};

const setupGameSockets = (io) => {
  const gameNamespace = io.of('/game');

  gameNamespace.on('connection', (socket) => {
    
    socket.on('join_room', async ({ roomId }) => {
      socket.join(roomId);
      
      let gameData = activeGames.get(roomId);
      if (!gameData) {
        // Initialize new game logic
        gameData = {
          chess: new Chess(),
          whiteId: null,
          blackId: null,
          whiteTimeMs: 600000,
          blackTimeMs: 600000,
          lastMoveTimestamp: Date.now()
        };
        activeGames.set(roomId, gameData);
      }

      socket.emit('game_state', {
        fen: gameData.chess.fen(),
        pgn: gameData.chess.pgn(),
        whiteTimeMs: gameData.whiteTimeMs,
        blackTimeMs: gameData.blackTimeMs,
      });
    });

    socket.on('make_move', ({ roomId, move }) => {
      const gameData = activeGames.get(roomId);
      if (!gameData) return;

      try {
        const result = gameData.chess.move(move);
        if (result) {
          gameData.lastMoveTimestamp = Date.now();
          // Broadcast valid move
          gameNamespace.to(roomId).emit('move_made', {
            fen: gameData.chess.fen(),
            pgn: gameData.chess.pgn(),
            move
          });

          if (gameData.chess.isGameOver()) {
            const reason = gameData.chess.isCheckmate() ? 'mate' : 'draw';
            const winner = gameData.chess.isCheckmate() ? (gameData.chess.turn() === 'w' ? 'black' : 'white') : 'draw';
            
            gameNamespace.to(roomId).emit('game_over', { reason, winner });
            
            // Save to DB
            const matchRecord = new Match({
              id: roomId,
              status: 'completed',
              pgn: gameData.chess.pgn(),
              fen: gameData.chess.fen(),
              winner,
              victory_status: reason
            });
            matchRecord.save().catch(console.error);

            activeGames.delete(roomId);
          }
        }
      } catch (err) {
        // Invalid move
        socket.emit('invalid_move', { message: 'Illegal move' });
      }
    });

    socket.on('offer_draw', ({ roomId }) => {
      socket.to(roomId).emit('draw_offered');
    });

    socket.on('resign', ({ roomId, color }) => {
      const winner = color === 'white' ? 'black' : 'white';
      gameNamespace.to(roomId).emit('game_over', { reason: 'resign', winner });
      
      const gameData = activeGames.get(roomId);
      if (gameData) {
        const matchRecord = new Match({
          id: roomId,
          status: 'completed',
          pgn: gameData.chess.pgn(),
          fen: gameData.chess.fen(),
          winner,
          victory_status: 'resign'
        });
        matchRecord.save().catch(console.error);
        activeGames.delete(roomId);
      }
    });

    socket.on('send_message', ({ roomId, message, sender }) => {
      gameNamespace.to(roomId).emit('receive_message', { message, sender });
    });

  });
};

module.exports = { setupGameSockets };
