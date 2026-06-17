const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Match = require('../models/match.model');
const Player = require('../models/player.model');
const Opening = require('../models/opening.model');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dummyMatches = [
  {
    id: "dummy_1",
    rated: true,
    created_at: String(Date.now()),
    last_move_at: String(Date.now() + 600000),
    turns: "45",
    victory_status: "mate",
    winner: "white",
    increment_code: "10+0",
    white_id: "hikaru",
    white_rating: "2800",
    black_id: "magnus",
    black_rating: "2850",
    moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4",
    opening_eco: "C70",
    opening_name: "Ruy Lopez",
    opening_ply: "7"
  },
  {
    id: "dummy_2",
    rated: true,
    created_at: String(Date.now() - 86400000),
    last_move_at: String(Date.now() - 86000000),
    turns: "30",
    victory_status: "resign",
    winner: "black",
    increment_code: "3+2",
    white_id: "hikaru",
    white_rating: "2805",
    black_id: "gothamchess",
    black_rating: "2400",
    moves: "d4 Nf6 c4 e6 Nc3 Bb4",
    opening_eco: "E20",
    opening_name: "Nimzo-Indian Defense",
    opening_ply: "6"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Match.deleteMany({});
    await Player.deleteMany({});
    await Opening.deleteMany({});
    console.log('Cleared existing collections');

    // Insert dummy matches
    await Match.insertMany(dummyMatches);
    console.log('Inserted dummy matches');

    // Generate players
    const players = [
      {
        username: "hikaru",
        currentRating: 2805,
        ratingHistory: [{ date: new Date(), rating: 2805 }],
        totalGames: 2,
        wins: 1,
        losses: 1,
        draws: 0,
        preferredOpenings: ["Ruy Lopez", "Nimzo-Indian Defense"],
        lastSeen: new Date()
      },
      {
        username: "magnus",
        currentRating: 2850,
        ratingHistory: [{ date: new Date(), rating: 2850 }],
        totalGames: 1,
        wins: 0,
        losses: 1,
        draws: 0,
        preferredOpenings: ["Ruy Lopez"],
        lastSeen: new Date()
      },
      {
        username: "gothamchess",
        currentRating: 2400,
        ratingHistory: [{ date: new Date(), rating: 2400 }],
        totalGames: 1,
        wins: 1,
        losses: 0,
        draws: 0,
        preferredOpenings: ["Nimzo-Indian Defense"],
        lastSeen: new Date()
      }
    ];
    await Player.insertMany(players);
    console.log('Inserted dummy players');

    // Generate openings
    const openings = [
      {
        eco: "C70",
        name: "Ruy Lopez",
        family: "Ruy Lopez",
        totalGames: 1,
        whiteWins: 1,
        blackWins: 0,
        draws: 0,
        winRate: { white: 100, black: 0, draw: 0 },
        avgPly: 7,
        complexity: "intermediate",
        style: "balanced"
      },
      {
        eco: "E20",
        name: "Nimzo-Indian Defense",
        family: "Nimzo-Indian",
        totalGames: 1,
        whiteWins: 0,
        blackWins: 1,
        draws: 0,
        winRate: { white: 0, black: 100, draw: 0 },
        avgPly: 6,
        complexity: "advanced",
        style: "balanced"
      }
    ];
    await Opening.insertMany(openings);
    console.log('Inserted dummy openings');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
