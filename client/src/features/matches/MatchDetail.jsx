import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Trash2, SkipBack, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import toast from 'react-hot-toast';
import { matchService } from '../../services/match.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { formatDate, formatDateTime, getResultBadgeClass } from '../../utils/formatters.js';

// Chess Constants
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const STARTING_COUNTS = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const BLACK_PIECES_UNICODE = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };
const WHITE_PIECES_UNICODE = { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕' };

const MatchDetail = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Chess Replay State
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [parsedMoves, setParsedMoves] = useState([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [kingSquare, setKingSquare] = useState(null);
  
  // Enhanced Review State
  const [chunkedMoves, setChunkedMoves] = useState([]);
  const [materialStats, setMaterialStats] = useState({
    wAdvantage: 0, bAdvantage: 0, wCaptured: [], bCaptured: []
  });

  const calculateMaterial = (chessInstance) => {
    const board = chessInstance.board();
    const counts = { w: { p:0, n:0, b:0, r:0, q:0 }, b: { p:0, n:0, b:0, r:0, q:0 } };
    let wScore = 0; let bScore = 0;
    
    for(let r=0; r<8; r++) {
      for(let c=0; c<8; c++) {
        const piece = board[r][c];
        if (piece && piece.type !== 'k') {
          counts[piece.color][piece.type]++;
          if (piece.color === 'w') wScore += PIECE_VALUES[piece.type];
          if (piece.color === 'b') bScore += PIECE_VALUES[piece.type];
        }
      }
    }

    const wCaptured = [];
    const bCaptured = [];
    const types = ['q', 'r', 'b', 'n', 'p']; // Sort by value descending
    
    types.forEach(type => {
      const missingBlack = STARTING_COUNTS[type] - counts.b[type];
      for(let i=0; i<missingBlack; i++) wCaptured.push(type);
      
      const missingWhite = STARTING_COUNTS[type] - counts.w[type];
      for(let i=0; i<missingWhite; i++) bCaptured.push(type);
    });

    return {
      wAdvantage: wScore - bScore > 0 ? wScore - bScore : 0,
      bAdvantage: bScore - wScore > 0 ? bScore - wScore : 0,
      wCaptured,
      bCaptured
    };
  };

  useEffect(() => {
    if (match?.moves) {
      const moveArray = match.moves.split(' ').filter(m => m.trim());
      setParsedMoves(moveArray);
      
      // Reset board when match loads
      setCurrentMoveIndex(-1);
      const newChess = new Chess();
      setFen(newChess.fen());
      setIsCheck(false);
      setIsCheckmate(false);
      setKingSquare(null);
      setMaterialStats(calculateMaterial(newChess));
      
      const chunks = [];
      for (let i = 0; i < moveArray.length; i += 2) {
        chunks.push({
          turn: Math.floor(i / 2) + 1,
          w: moveArray[i], wIndex: i,
          b: moveArray[i + 1] || null, bIndex: i + 1 < moveArray.length ? i + 1 : null
        });
      }
      setChunkedMoves(chunks);
    }
  }, [match]);

  const goToMove = (index) => {
    if (index < -1 || index >= parsedMoves.length) return;
    
    const newChess = new Chess();
    for (let i = 0; i <= index; i++) {
      try {
        newChess.move(parsedMoves[i]);
      } catch (e) {
        console.error('Invalid move:', parsedMoves[i]);
      }
    }
    setFen(newChess.fen());
    setCurrentMoveIndex(index);
    
    setIsCheck(newChess.inCheck());
    setIsCheckmate(newChess.isCheckmate());
    if (newChess.inCheck()) {
      const board = newChess.board();
      for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
          if (board[r][c] && board[r][c].type === 'k' && board[r][c].color === newChess.turn()) {
            setKingSquare(String.fromCharCode(97+c) + (8-r));
          }
        }
      }
    } else {
      setKingSquare(null);
    }
    
    setMaterialStats(calculateMaterial(newChess));
  };

  useEffect(() => {
    const controller = new AbortController();
    matchService.getById(id)
      .then((res) => setMatch(res.data?.data?.match ?? res.data?.match ?? res.data?.data ?? res.data))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  const handleDelete = async () => {
    try {
      await matchService.remove(id);
      toast.success('MATCH DELETED');
      navigate('/matches');
    } catch {
      toast.error('DELETE FAILED');
    }
  };

  if (loading) return (
    <div>
      <Skeleton height={40} width="40%" className="mb-4" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
    </div>
  );

  if (error) return <ErrorState title="MATCH NOT FOUND" message={error} />;
  if (!match) return null;

  const fields = [
    ['Match ID', match._id],
    ['White Player', match.white_id],
    ['White Rating', match.white_rating],
    ['Black Player', match.black_id],
    ['Black Rating', match.black_rating],
    ['Winner', match.winner?.toUpperCase()],
    ['Turns', match.turns],
    ['Opening ECO', match.opening_eco],
    ['Opening Name', match.opening_name || match.opening],
    ['Time Increment', match.time_increment],
    ['Rated', match.rated ? 'YES' : 'NO'],
    ['Created At', formatDateTime(match.createdAt)],
  ];

  return (
    <>
      <Helmet>
        <title>Match Detail | Chess Match Analytics</title>
      </Helmet>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/matches" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> BACK</Link>
          <h1>Match Detail</h1>
          <Badge variant={getResultBadgeClass(match.winner).replace('badge-', '')}>
            {match.winner?.toUpperCase() || '—'}
          </Badge>
        </div>
        {isAdmin && (
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={14} /> DELETE
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* Chessboard Replay */}
        <div style={{ background: 'var(--color-bg-alt)', padding: 'var(--space-4)', border: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Top Player Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 32, height: 32, background: 'var(--color-muted)', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
                  {match.winner === 'black' ? match.white_id : match.black_id}
                </div>
                <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}>
                  ({match.winner === 'black' ? match.white_rating : match.black_rating})
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.4em', letterSpacing: '-0.1em' }}>
              {(match.winner === 'black' ? materialStats.wCaptured : materialStats.bCaptured).map((p, i) => (
                <span key={i}>{(match.winner === 'black' ? WHITE_PIECES_UNICODE : BLACK_PIECES_UNICODE)[p]}</span>
              ))}
              {(match.winner === 'black' ? materialStats.wAdvantage : materialStats.bAdvantage) > 0 && (
                <span style={{ fontSize: '0.5em', color: 'var(--color-muted)', marginLeft: 'var(--space-2)', fontFamily: 'var(--font-ui)', letterSpacing: '0' }}>
                  +{(match.winner === 'black' ? materialStats.wAdvantage : materialStats.bAdvantage)}
                </span>
              )}
            </div>
          </div>

          <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%', maxWidth: '460px', margin: '0 auto' }}>
            <Chessboard 
              options={{
                position: fen,
                boardOrientation: match.winner === 'black' ? 'black' : 'white',
                darkSquareStyle: { backgroundColor: 'var(--color-green)' },
                lightSquareStyle: { backgroundColor: '#F5F2EB' },
                squareStyles: kingSquare ? {
                  [kingSquare]: {
                    background: isCheckmate ? 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, transparent 80%)' : 'radial-gradient(circle, rgba(255,165,0,0.8) 0%, transparent 80%)',
                    borderRadius: '50%'
                  }
                } : {}
              }}
            />
            {isCheckmate && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                background: 'var(--color-primary)', color: 'white', border: 'var(--border-thin)', 
                padding: 'var(--space-3) var(--space-5)', fontFamily: 'var(--font-display)', fontSize: '28px', 
                fontWeight: 'bold', boxShadow: 'var(--shadow-hard)', zIndex: 10, letterSpacing: '0.05em'
              }}>
                CHECKMATE
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
            <Button id="btn-first" variant="secondary" size="sm" onClick={() => goToMove(-1)} disabled={currentMoveIndex === -1}>
              <SkipBack size={16} />
            </Button>
            <Button id="btn-prev" variant="secondary" size="sm" onClick={() => goToMove(currentMoveIndex - 1)} disabled={currentMoveIndex === -1}>
              <ChevronLeft size={16} />
            </Button>
            <div style={{ padding: '0 var(--space-3)', display: 'flex', alignItems: 'center', fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', minWidth: '80px', justifyContent: 'center' }}>
              {currentMoveIndex + 1} / {parsedMoves.length}
            </div>
            <Button id="btn-next" variant="secondary" size="sm" onClick={() => goToMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= parsedMoves.length - 1}>
              <ChevronRight size={16} />
            </Button>
            <Button id="btn-last" variant="secondary" size="sm" onClick={() => goToMove(parsedMoves.length - 1)} disabled={currentMoveIndex >= parsedMoves.length - 1}>
              <SkipForward size={16} />
            </Button>
          </div>

          {/* Bottom Player Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 32, height: 32, background: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
                  {match.winner === 'black' ? match.black_id : match.white_id}
                </div>
                <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}>
                  ({match.winner === 'black' ? match.black_rating : match.white_rating})
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.4em', letterSpacing: '-0.1em' }}>
              {(match.winner === 'black' ? materialStats.bCaptured : materialStats.wCaptured).map((p, i) => (
                <span key={i}>{(match.winner === 'black' ? BLACK_PIECES_UNICODE : WHITE_PIECES_UNICODE)[p]}</span>
              ))}
              {(match.winner === 'black' ? materialStats.bAdvantage : materialStats.wAdvantage) > 0 && (
                <span style={{ fontSize: '0.5em', color: 'var(--color-muted)', marginLeft: 'var(--space-2)', fontFamily: 'var(--font-ui)', letterSpacing: '0' }}>
                  +{(match.winner === 'black' ? materialStats.bAdvantage : materialStats.wAdvantage)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Move List & Match Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          {/* Move List */}
          <div style={{ background: 'var(--color-bg-alt)', border: 'var(--border-thin)', display: 'flex', flexDirection: 'column', height: '300px' }}>
            <div style={{ padding: 'var(--space-3)', borderBottom: 'var(--border-thin)', fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
              MOVE LIST
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {chunkedMoves.map((chunk) => (
                <div key={chunk.turn} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)' }}>
                  <div style={{ padding: '4px 8px', color: 'var(--color-muted)', background: 'var(--color-bg)' }}>
                    {chunk.turn}.
                  </div>
                  <div 
                    onClick={() => goToMove(chunk.wIndex)}
                    style={{ 
                      padding: '4px 8px', cursor: 'pointer', 
                      background: currentMoveIndex === chunk.wIndex ? 'var(--color-primary)' : 'transparent',
                      color: currentMoveIndex === chunk.wIndex ? 'white' : 'inherit',
                      fontWeight: currentMoveIndex === chunk.wIndex ? 'bold' : 'normal'
                    }}
                  >
                    {chunk.w}
                  </div>
                  {chunk.b && (
                    <div 
                      onClick={() => goToMove(chunk.bIndex)}
                      style={{ 
                        padding: '4px 8px', cursor: 'pointer', 
                        background: currentMoveIndex === chunk.bIndex ? 'var(--color-primary)' : 'transparent',
                        color: currentMoveIndex === chunk.bIndex ? 'white' : 'inherit',
                        fontWeight: currentMoveIndex === chunk.bIndex ? 'bold' : 'normal'
                      }}
                    >
                      {chunk.b}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {fields.map(([label, value]) => value != null && (
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 16px',
              border: 'var(--border-thin)',
              background: 'var(--color-bg-alt)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>
                {label}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                {value || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="DELETE THIS MATCH?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>CANCEL</Button>
            <Button variant="danger" onClick={handleDelete}>CONFIRM DELETE</Button>
          </>
        }
      >
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
          This action is permanent and cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default MatchDetail;
