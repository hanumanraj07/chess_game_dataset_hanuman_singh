const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Match = require('./src/models/Match');
const { Chess } = require('chess.js');

dotenv.config();

const pgnText = `
[Event "FIDE World Cup 2023"]
[Site "Baku AZE"]
[Date "2023.08.12"]
[Round "4.1"]
[White "Carlsen,M"]
[Black "Keymer,Vincent"]
[Result "0-1"]
[WhiteElo "2835"]
[BlackElo "2690"]
[EventDate "2023.07.30"]
[ECO "C65"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Bc5 5. c3 O-O 6. O-O d6 7. h3
`;

async function testUpload() {
  await mongoose.connect(process.env.MONGODB_URI);
  
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
      
      parsedMatches.push({
        id: header.Site || Date.now().toString() + Math.random(),
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
      console.error(e);
    }
  }

  try {
    for (const data of parsedMatches) {
      const existing = await Match.findOne({ id: data.id });
      if (existing) {
        console.log('Exists');
      } else {
        await Match.create(data);
        console.log('Created!');
      }
    }
  } catch (err) {
    console.error('MONGOOSE ERROR:', err);
  }
  process.exit(0);
}

testUpload();
