const fs = require('fs');
const { Chess } = require('chess.js');

const pgnText = fs.readFileSync('../Abdusattorov.pgn', 'utf8');

const normalizedText = pgnText.replace(/\r\n/g, '\n');
const games = normalizedText.split(/(?=\[Event )/i).map(g => g.trim()).filter(Boolean);

console.log(games[0]);

try {
  const chess = new Chess();
  chess.loadPgn(games[0]);
  console.log('Parsed game 1 successfully!');
} catch (e) {
  console.log('Game 1 Parse Error:', e);
}
