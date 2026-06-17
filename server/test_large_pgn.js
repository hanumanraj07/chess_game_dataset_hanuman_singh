const fs = require('fs');
const { Chess } = require('chess.js');

const pgnText = fs.readFileSync('../Abdusattorov.pgn', 'utf8');

const normalizedText = pgnText.replace(/\r\n/g, '\n');
const games = normalizedText.split(/(?=\[Event )/i).map(g => g.trim()).filter(Boolean);

console.log('Total games found:', games.length);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < games.length; i++) {
  try {
    const chess = new Chess();
    const success = chess.loadPgn(games[i]);
    if (success) successCount++;
    else failCount++;
  } catch (e) {
    failCount++;
  }
}

console.log('Parsed successfully:', successCount);
console.log('Failed:', failCount);
