const fs = require('fs');
const { Chess } = require('chess.js');

const pgnText = fs.readFileSync('../Abdusattorov.pgn', 'utf8');
const normalizedText = pgnText.replace(/\r\n/g, '\n');
const games = normalizedText.split(/(?=\[Event )/i).map(g => g.trim()).filter(Boolean);

console.log('Total games found:', games.length);

let successCount = 0;
let failCount = 0;

const c = new Chess();
try {
  c.loadPgn(games[0]);
  console.log('Game 0 loadPgn success!');
  console.log('Header keys:', Object.keys(c.header()).length);
  console.log('History length:', c.history().length);
} catch (e) {
  console.error('ERROR PARSING GAME 0:', e.message);
}
