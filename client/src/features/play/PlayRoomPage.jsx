import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PlayRoomPage() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState('Waiting to join...');

  useEffect(() => {
    const token = localStorage.getItem('chess_auth_token');
    const newSocket = io('http://localhost:5000/game', {
      auth: { token }
    });

    newSocket.on('connect', () => console.log('Connected to game namespace'));

    newSocket.on('game_state', (data) => {
      setGame(new Chess(data.fen));
      setStatus('Game in progress');
    });

    newSocket.on('move_made', (data) => {
      setGame(new Chess(data.fen));
    });

    newSocket.on('game_over', (data) => {
      setStatus(`Game Over: ${data.reason} - Winner: ${data.winner}`);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleJoin = () => {
    if (!roomId) return;
    socket.emit('join_room', { roomId });
    setJoined(true);
    setStatus('Joined Room. Waiting for game state...');
  };

  const handleCreate = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    socket.emit('join_room', { roomId: newRoomId });
    setJoined(true);
    setStatus('Room Created. Waiting for opponent...');
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = { from: sourceSquare, to: targetSquare, promotion: 'q' };
    
    // Optimistic UI update
    const newGame = new Chess(game.fen());
    try {
      const result = newGame.move(move);
      if (result) {
        setGame(newGame);
        socket.emit('make_move', { roomId, move });
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const handleResign = () => {
    socket.emit('resign', { roomId, color: 'white' }); // TODO: dynamic color
  };

  if (!joined) {
    return (
      <div className="p-8 max-w-md mx-auto space-y-6">
        <h1 className="text-4xl font-black uppercase">Play Room</h1>
        <Card className="p-6 brutal-shadow space-y-4">
          <Button className="w-full text-lg py-4" onClick={handleCreate}>CREATE PRIVATE ROOM</Button>
          <div className="text-center font-bold">OR</div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="ROOM ID" 
              className="flex-1 border-4 border-black p-2 font-bold uppercase"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
            />
            <Button onClick={handleJoin}>JOIN</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Room: {roomId}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-4 brutal-shadow flex justify-center bg-gray-50">
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
          <Card className="p-4 brutal-shadow bg-yellow-100">
            <h3 className="font-bold uppercase text-sm mb-1 text-gray-500">Status</h3>
            <p className="font-bold text-lg">{status}</p>
          </Card>

          <Card className="p-6 brutal-shadow space-y-4">
            <Button variant="outline" className="w-full" onClick={handleResign}>RESIGN</Button>
            <Button variant="outline" className="w-full">OFFER DRAW</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
