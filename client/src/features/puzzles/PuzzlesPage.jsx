import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Dummy Puzzle Database
const DUMMY_PUZZLES = [
  {
    id: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['h5f7'],
    rating: 800,
    theme: 'Mate in 1'
  },
  {
    id: 2,
    fen: '8/8/8/8/4k3/4p3/4Q3/4K3 w - - 0 1',
    solution: ['e2c4', 'e4f3', 'c4e2'],
    rating: 1200,
    theme: 'Perpetual Check'
  }
];

export default function PuzzlesPage() {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState('Solve the puzzle!');
  const [streak, setStreak] = useState(0);

  const puzzle = DUMMY_PUZZLES[currentPuzzleIndex];

  useEffect(() => {
    loadPuzzle();
  }, [currentPuzzleIndex]);

  const loadPuzzle = () => {
    setGame(new Chess(puzzle.fen));
    setMoveIndex(0);
    setStatus('Solve the puzzle! Find the best move.');
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const newGame = new Chess(game.fen());
    try {
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
      if (move === null) return false;

      const userMoveStr = move.from + move.to;
      const expectedMoveStr = puzzle.solution[moveIndex];

      if (userMoveStr === expectedMoveStr) {
        setGame(newGame);
        
        if (moveIndex + 1 === puzzle.solution.length) {
          setStatus('Puzzle Solved! Great job.');
          setStreak(s => s + 1);
          setTimeout(nextPuzzle, 1500);
        } else {
          setStatus('Correct! But there is more...');
          setMoveIndex(i => i + 1);
          
          // Auto-play opponent's response
          setTimeout(() => {
            const oppMoveStr = puzzle.solution[moveIndex + 1];
            if (oppMoveStr) {
              const oppGame = new Chess(newGame.fen());
              oppGame.move({ from: oppMoveStr.substring(0, 2), to: oppMoveStr.substring(2, 4), promotion: 'q' });
              setGame(oppGame);
              setMoveIndex(i => i + 2);
            }
          }, 500);
        }
        return true;
      } else {
        setStatus('Incorrect move. Try again!');
        setStreak(0);
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  const nextPuzzle = () => {
    setCurrentPuzzleIndex((i) => (i + 1) % DUMMY_PUZZLES.length);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Puzzles</h1>
        <div className="text-2xl font-bold bg-black text-white px-4 py-2 border-2 border-black">
          STREAK: {streak}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-4 brutal-shadow bg-gray-50 flex justify-center">
            <div className="w-full max-w-[50vh] md:max-w-[400px] mx-auto">
              <Chessboard 
                position={game.fen()} 
                onPieceDrop={onDrop}
                customDarkSquareStyle={{ backgroundColor: '#000000' }}
                customLightSquareStyle={{ backgroundColor: '#ffffff' }}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 brutal-shadow bg-blue-50">
            <h2 className="text-xl font-bold mb-2 uppercase">Current Puzzle</h2>
            <div className="text-sm font-bold text-gray-600 mb-1">RATING: {puzzle.rating}</div>
            <div className="text-sm font-bold text-gray-600 mb-4">THEME: {puzzle.theme}</div>
            
            <p className="text-lg font-bold mb-6">{status}</p>

            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={loadPuzzle}>RETRY PUZZLE</Button>
              <Button variant="primary" className="w-full" onClick={nextPuzzle}>SKIP PUZZLE</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
