import { useState, useEffect, useRef } from 'react';

const useStockfish = (fen, enabled = true) => {
  const workerRef = useRef(null);
  const fenRef = useRef(fen);
  
  const [evaluation, setEvaluation] = useState('0.00');
  const [bestMove, setBestMove] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Keep a fresh reference to the FEN so the worker message handler doesn't use stale state.
  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  // Initialize the worker once.
  useEffect(() => {
    workerRef.current = new Worker('/stockfish.js');
    workerRef.current.postMessage('uci');

    workerRef.current.onmessage = (event) => {
      const line = typeof event.data === 'string' ? event.data : '';
      
      if (line.includes('info depth')) {
        const matchScore = line.match(/score cp (-?\d+)/);
        const matchMate = line.match(/score mate (-?\d+)/);
        
        if (matchScore) {
          let score = parseInt(matchScore[1], 10) / 100;
          // In UCI, evaluation is relative to the side to move.
          if (fenRef.current.includes(' b ')) {
            score = -score;
          }
          setEvaluation(score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2));
        } else if (matchMate) {
          const mateIn = parseInt(matchMate[1], 10);
          setEvaluation(mateIn > 0 ? `+M${mateIn}` : `-M${Math.abs(mateIn)}`);
        }
      }
      
      if (line.includes('bestmove')) {
        const parts = line.split(' ');
        if (parts.length >= 2 && parts[1] !== '(none)') {
          setBestMove(parts[1]);
        }
        setIsCalculating(false);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // When FEN changes (or we toggle enable), instruct Stockfish to calculate.
  useEffect(() => {
    if (!enabled || !workerRef.current) {
      if (!enabled) {
         setEvaluation('0.00');
         setBestMove('');
         setIsCalculating(false);
      }
      return;
    }
    
    setIsCalculating(true);
    setEvaluation('...');
    setBestMove('');
    
    // Stop any existing calculation
    workerRef.current.postMessage('stop');
    // Provide the new board state
    workerRef.current.postMessage(`position fen ${fen}`);
    // Instruct the engine to search for the best move up to a depth of 10
    // Depth 10 is fast enough for real-time web playback without freezing the UI.
    workerRef.current.postMessage('go depth 10');
    
  }, [fen, enabled]);

  return { evaluation, bestMove, isCalculating };
};

export default useStockfish;
