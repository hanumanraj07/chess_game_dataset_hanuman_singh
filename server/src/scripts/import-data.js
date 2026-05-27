const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const toDate = value => {
  const timestamp = Number(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
};

const ensurePlayer = (players, username) => {
  if (!players.has(username)) {
    players.set(username, {
      username,
      currentRating: 0,
      ratingHistory: [],
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      openingCounts: new Map(),
      lastSeen: null,
    });
  }

  return players.get(username);
};

const updatePlayer = (player, doc, color) => {
  const rating = Number(color === 'white' ? doc.white_rating : doc.black_rating);
  const gameDate = toDate(doc.created_at);

  player.totalGames += 1;
  if (doc.winner === color) player.wins += 1;
  else if (doc.winner === 'draw') player.draws += 1;
  else player.losses += 1;

  if (Number.isFinite(rating)) {
    player.ratingHistory.push({ date: gameDate || new Date(), rating });
    if (!player.lastSeen || (gameDate && gameDate > player.lastSeen)) {
      player.currentRating = rating;
      player.lastSeen = gameDate;
    }
  }

  if (doc.opening_name) {
    player.openingCounts.set(
      doc.opening_name,
      (player.openingCounts.get(doc.opening_name) || 0) + 1
    );
  }
};

const buildDerivedCollections = async (targetDb) => {
  const matches = await targetDb.db.collection('matches').find({ isDeleted: false }).toArray();
  const players = new Map();
  const openings = new Map();

  for (const doc of matches) {
    if (doc.white_id) updatePlayer(ensurePlayer(players, doc.white_id), doc, 'white');
    if (doc.black_id) updatePlayer(ensurePlayer(players, doc.black_id), doc, 'black');

    if (doc.opening_eco) {
      const opening = openings.get(doc.opening_eco) || {
        eco: doc.opening_eco,
        name: doc.opening_name,
        family: doc.opening_name ? doc.opening_name.split(':')[0].trim() : '',
        totalGames: 0,
        whiteWins: 0,
        blackWins: 0,
        draws: 0,
        plyTotal: 0,
        plyCount: 0,
        complexity: 'intermediate',
        style: doc.opening_name && /gambit/i.test(doc.opening_name) ? 'gambit' : 'balanced',
      };

      opening.totalGames += 1;
      if (doc.winner === 'white') opening.whiteWins += 1;
      if (doc.winner === 'black') opening.blackWins += 1;
      if (doc.winner === 'draw') opening.draws += 1;

      const openingPly = Number(doc.opening_ply);
      if (Number.isFinite(openingPly)) {
        opening.plyTotal += openingPly;
        opening.plyCount += 1;
      }

      openings.set(doc.opening_eco, opening);
    }
  }

  const playerDocs = [...players.values()].map(player => ({
    username: player.username,
    currentRating: player.currentRating,
    ratingHistory: player.ratingHistory.slice(-50),
    totalGames: player.totalGames,
    wins: player.wins,
    losses: player.losses,
    draws: player.draws,
    preferredOpenings: [...player.openingCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name),
    lastSeen: player.lastSeen,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const openingDocs = [...openings.values()].map(opening => ({
    eco: opening.eco,
    name: opening.name,
    family: opening.family,
    totalGames: opening.totalGames,
    whiteWins: opening.whiteWins,
    blackWins: opening.blackWins,
    draws: opening.draws,
    winRate: {
      white: Number(((opening.whiteWins / opening.totalGames) * 100).toFixed(1)),
      black: Number(((opening.blackWins / opening.totalGames) * 100).toFixed(1)),
      draw: Number(((opening.draws / opening.totalGames) * 100).toFixed(1)),
    },
    avgPly: opening.plyCount ? Number((opening.plyTotal / opening.plyCount).toFixed(1)) : null,
    complexity: opening.complexity,
    style: opening.style,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await targetDb.db.collection('players').deleteMany({});
  await targetDb.db.collection('openings').deleteMany({});

  if (playerDocs.length) {
    await targetDb.db.collection('players').insertMany(playerDocs, { ordered: false });
  }

  if (openingDocs.length) {
    await targetDb.db.collection('openings').insertMany(openingDocs, { ordered: false });
  }

  return { players: playerDocs.length, openings: openingDocs.length };
};

async function importData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const sourceDb = mongoose.connection.useDb('chess_project');
    const targetDb = mongoose.connection.useDb('chessData');

    const sourceCount = await sourceDb.db.collection('chessData').countDocuments();
    console.log(`Source documents: ${sourceCount}`);

    await targetDb.db.collection('matches').deleteMany({});
    console.log('Cleared existing matches collection');

    const BATCH_SIZE = 500;
    let totalInserted = 0;
    let totalSkipped = 0;
    let skip = 0;

    while (true) {
      const batch = await sourceDb.db.collection('chessData')
        .find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .toArray();

      if (batch.length === 0) break;

      const docs = batch.map(doc => ({
        id: doc.id,
        rated: doc.rated,
        created_at: String(doc.created_at),
        last_move_at: String(doc.last_move_at),
        turns: String(doc.turns),
        victory_status: doc.victory_status,
        winner: doc.winner,
        increment_code: doc.increment_code,
        white_id: doc.white_id,
        white_rating: String(doc.white_rating),
        black_id: doc.black_id,
        black_rating: String(doc.black_rating),
        moves: doc.moves,
        opening_eco: doc.opening_eco,
        opening_name: doc.opening_name,
        opening_ply: String(doc.opening_ply),
        isArchived: false,
        isDeleted: false,
      }));

      try {
        const result = await targetDb.db.collection('matches').insertMany(docs, { ordered: false });
        totalInserted += result.insertedCount;
      } catch (err) {
        if (err.insertedCount) {
          totalInserted += err.insertedCount;
        }
        totalSkipped += (docs.length - (err.insertedCount || 0));
      }

      skip += BATCH_SIZE;
      console.log(`Progress: ${totalInserted} inserted, ${totalSkipped} skipped (${skip}/${sourceCount})`);
    }

    const finalCount = await targetDb.db.collection('matches').countDocuments();
    const derivedCounts = await buildDerivedCollections(targetDb);
    console.log(`\nDone! Total matches in database: ${finalCount}`);
    console.log(`Derived players: ${derivedCounts.players}`);
    console.log(`Derived openings: ${derivedCounts.openings}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

importData();
