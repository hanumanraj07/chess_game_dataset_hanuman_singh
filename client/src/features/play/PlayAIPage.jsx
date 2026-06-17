import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { engineService } from '../../services/engineService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PlayAIPage() {
  const [game, setGame] = useState(new Chess());
  const [difficulty, setDifficulty] = useState(5); // 0-20
  const [playerColor, setPlayerColor] = useState('w');
  const [status, setStatus] = useState('Select Difficulty & Color to Start');
  const [evalScore, setEvalScore] = useState(0);

  const makeAIMove = () => {
    setStatus('AI is thinking...');
    engineService.findBestMove(game.fen(), difficulty, 10, 500, {
      onBestMove: (moveStr) => {
        const move = {
          from: moveStr.substring(0, 2),
          to: moveStr.substring(2, 4),
          promotion: moveStr.length > 4 ? moveStr.substring(4, 5) : 'q'
        };
        const newGame = new Chess(game.fen());
        newGame.move(move);
        setGame(newGame);
        
        if (newGame.isGameOver()) {
          if (newGame.isCheckmate()) setStatus('Checkmate! AI Wins.');
          else if (newGame.isDraw()) setStatus('Draw!');
        } else {
          setStatus('Your Turn');
        }
      },
      onEval: (info) => {
        if (info.type === 'cp') setEvalScore(info.value / 100);
      }
    });
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (game.turn() !== playerColor) return false;
    
    const newGame = new Chess(game.fen());
    try {
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
      if (move === null) return false;
      
      setGame(newGame);
      
      if (newGame.isGameOver()) {
        if (newGame.isCheckmate()) setStatus('Checkmate! You Win!');
        else if (newGame.isDraw()) setStatus('Draw!');
      } else {
        setTimeout(makeAIMove, 300);
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleUndo = () => {
    const newGame = new Chess(game.fen());
    newGame.undo(); // Undo AI move
    newGame.undo(); // Undo Player move
    setGame(newGame);
    setStatus('Your Turn');
  };

  const startNewGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setStatus('Your Turn');
    if (playerColor === 'b') {
      setTimeout(makeAIMove, 300);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Play vs AI</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-4 brutal-shadow flex justify-center bg-gray-50 relative">
            <div className="absolute top-2 left-2 text-sm font-bold bg-white px-2 border-2 border-black">
              Eval: {playerColor === 'w' ? evalScore : -evalScore}
            </div>
            <div className="w-full max-w-[50vh] md:max-w-[400px] mx-auto">
              <Chessboard 
                position={game.fen()} 
                onPieceDrop={onDrop}
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                customDarkSquareStyle={{ backgroundColor: '#000000' }}
                customLightSquareStyle={{ backgroundColor: '#ffffff' }}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 brutal-shadow">
            <h2 className="text-xl font-bold mb-4 uppercase">Match Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-1">Color</label>
                <div className="flex gap-2">
                  <Button variant={playerColor === 'w' ? 'primary' : 'outline'} onClick={() => setPlayerColor('w')} className="flex-1">White</Button>
                  <Button variant={playerColor === 'b' ? 'primary' : 'outline'} onClick={() => setPlayerColor('b')} className="flex-1">Black</Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-1">AI Difficulty (0-20)</label>
                <input 
                  type="range" 
                  min="0" max="20" 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(parseInt(e.target.value))}
                  className="w-full accent-black border-2 border-black"
                />
                <div className="text-right font-bold">{difficulty}</div>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full text-lg py-3" onClick={startNewGame}>START GAME</Button>
                <Button variant="outline" className="w-full" onClick={handleUndo}>UNDO MOVE</Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 brutal-shadow bg-yellow-100">
            <h3 className="font-bold uppercase text-sm mb-1 text-gray-500">Status</h3>
            <p className="font-bold text-lg">{status}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
