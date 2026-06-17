const { Chess } = require('chess.js');
const c = new Chess();
try {
  c.loadPgn('[Event "FIDE"]\n\n1. e4 e5');
  console.log('headers:', c.header());
  console.log('history:', c.history());
} catch(e) {
  console.error('ERROR:', e.message);
}
