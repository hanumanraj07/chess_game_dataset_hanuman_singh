const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Chess } = require('chess.js');
const Match = require('./src/models/Match');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const pgnText = fs.readFileSync('../Abdusattorov.pgn', 'utf8');
  const normalizedText = pgnText.replace(/\r\n/g, '\n');
  const games = normalizedText.split(/(?=\[Event )/i).map(g => g.trim()).filter(Boolean);

  const parsedMatches = [];

  for (const gameText of games) {
    try {
      const chess = new Chess();
      chess.loadPgn(gameText);
      const header = chess.header();
      
      let winner = 'draw';
      if (header.Result === '1-0') winner = 'white';
      if (header.Result === '0-1') winner = 'black';
      
      let vicStatus = 'draw';
      const term = (header.Termination || '').toLowerCase();
      if (term.includes('mate')) vicStatus = 'mate';
      else if (term.includes('resign')) vicStatus = 'resign';
      else if (term.includes('time')) vicStatus = 'outoftime';
      
      let uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      if (header.Site && header.Site.includes('http')) {
        const parts = header.Site.split('/');
        if (parts.length > 3) uniqueId = parts.pop();
      }

      parsedMatches.push({
        id: uniqueId,
        rated: (header.Event && header.Event.toLowerCase().includes('rated')) ? 'TRUE' : 'FALSE',
        created_at: header.Date ? header.Date.replace(/\./g, '-') : new Date().toISOString(),
        last_move_at: new Date().toISOString(),
        turns: chess.history().length.toString(),
        victory_status: vicStatus,
        winner,
        increment_code: header.TimeControl || '',
        white_id: header.White || 'Unknown',
        white_rating: header.WhiteElo || '',
        black_id: header.Black || 'Unknown',
        black_rating: header.BlackElo || '',
        moves: chess.history().join(' '),
        opening_eco: header.ECO || '',
        opening_name: header.Opening || '',
      });
    } catch (e) {
      console.error('Parse Error on a game');
    }
  }

  console.log('Parsed', parsedMatches.length, 'games');

  try {
    const result = await Match.insertMany(parsedMatches, { ordered: false });
    console.log('Inserted', result.length);
  } catch (err) {
    console.log('InsertMany Error Message:', err.message);
    if (err.name === 'ValidationError') {
      console.log(err.errors);
    }
  }
  process.exit(0);
}

run();
