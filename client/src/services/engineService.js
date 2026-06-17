/**
 * Stockfish Web Worker Service
 */
class EngineService {
  constructor() {
    this.stockfish = new Worker('/engine/stockfish.js');
    this.isReady = false;
    this.callbacks = {};

    this.stockfish.onmessage = (event) => {
      const line = event.data;
      if (line === 'uciok') {
        this.isReady = true;
      }
      
      // Bestmove response: "bestmove e2e4 ponder e7e5"
      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        if (this.callbacks.onBestMove) {
          this.callbacks.onBestMove(move);
        }
      }

      // Eval info
      if (line.startsWith('info depth')) {
        const scoreMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        if (this.callbacks.onEval) {
          if (mateMatch) {
            this.callbacks.onEval({ type: 'mate', value: parseInt(mateMatch[1]) });
          } else if (scoreMatch) {
            this.callbacks.onEval({ type: 'cp', value: parseInt(scoreMatch[1]) });
          }
        }
      }
    };

    this.sendCommand('uci');
  }

  sendCommand(cmd) {
    if (this.stockfish) {
      this.stockfish.postMessage(cmd);
    }
  }

  setDifficulty(level) {
    // Level 0 (Beginner) to 20 (Master)
    this.sendCommand(`setoption name Skill Level value ${level}`);
  }

  evaluatePosition(fen, depth = 15, callbacks = {}) {
    this.callbacks = callbacks;
    this.sendCommand('ucinewgame');
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${depth}`);
  }

  findBestMove(fen, level = 10, depth = 10, timeLimitMs = 1000, callbacks = {}) {
    this.callbacks = callbacks;
    this.setDifficulty(level);
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${depth} movetime ${timeLimitMs}`);
  }

  stop() {
    this.sendCommand('stop');
  }

  quit() {
    if (this.stockfish) {
      this.sendCommand('quit');
      this.stockfish.terminate();
    }
  }
}

export const engineService = new EngineService();
