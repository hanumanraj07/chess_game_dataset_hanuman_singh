import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PlayRandomPage() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('Select a Time Control to Join Queue');
  const [inQueue, setInQueue] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('chess_auth_token');
    const newSocket = io('http://localhost:5000/matchmaking', {
      auth: { token }
    });

    newSocket.on('connect', () => console.log('Connected to matchmaking namespace'));

    newSocket.on('queue_joined', ({ mode }) => {
      setInQueue(true);
      setStatus(`Searching for opponent in ${mode}...`);
    });

    newSocket.on('queue_left', () => {
      setInQueue(false);
      setStatus('Left queue. Select a Time Control.');
    });

    newSocket.on('match_found', ({ roomId, players }) => {
      setStatus('MATCH FOUND! Joining game...');
      setTimeout(() => {
        // Redirect to the room and auto-join
        navigate('/play/room', { state: { autoJoin: roomId } });
      }, 1500);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [navigate]);

  const joinQueue = (mode) => {
    if (!socket) return;
    setSelectedMode(mode);
    socket.emit('join_queue', { mode, rating: 1200 }); // Hardcoded rating for now
  };

  const leaveQueue = () => {
    if (!socket || !selectedMode) return;
    socket.emit('leave_queue', { mode: selectedMode });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-center">
      <h1 className="text-5xl font-black uppercase">Play Online</h1>
      <p className="text-xl font-bold">{status}</p>

      {!inQueue ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-8 brutal-shadow flex flex-col gap-4 items-center hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => joinQueue('bullet')}>
            <h2 className="text-3xl font-black uppercase">Bullet</h2>
            <p className="font-bold text-gray-600">1 min</p>
          </Card>
          <Card className="p-8 brutal-shadow flex flex-col gap-4 items-center hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => joinQueue('blitz')}>
            <h2 className="text-3xl font-black uppercase">Blitz</h2>
            <p className="font-bold text-gray-600">3 min</p>
          </Card>
          <Card className="p-8 brutal-shadow flex flex-col gap-4 items-center hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => joinQueue('rapid')}>
            <h2 className="text-3xl font-black uppercase">Rapid</h2>
            <p className="font-bold text-gray-600">10 min</p>
          </Card>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="animate-pulse w-32 h-32 bg-black rounded-full flex items-center justify-center">
             <span className="text-white font-bold uppercase">Searching</span>
          </div>
          <Button variant="outline" className="text-xl px-12 py-4" onClick={leaveQueue}>CANCEL MATCHMAKING</Button>
        </div>
      )}
    </div>
  );
}
