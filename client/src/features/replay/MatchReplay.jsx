import React, { useEffect, useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, RefreshCw, Activity, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import useStockfish from '../analysis/useStockfish.js';

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const STARTING_COUNTS = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const BLACK_PIECES_UNICODE = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };
const WHITE_PIECES_UNICODE = { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕' };

const MatchReplay = ({ match }) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [parsedMoves, setParsedMoves] = useState([]);
  const [chunkedMoves, setChunkedMoves] = useState([]);
  
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [kingSquare, setKingSquare] = useState(null);
  const [materialStats, setMaterialStats] = useState({ wAdvantage: 0, bAdvantage: 0, wCaptured: [], bCaptured: [] });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState(match?.winner === 'black' ? 'black' : 'white');
  const [showEval, setShowEval] = useState(true);

  const { evaluation, bestMove, isCalculating } = useStockfish(fen, showEval);

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
    const types = ['q', 'r', 'b', 'n', 'p']; 
    
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

  const goToMove = useCallback((index) => {
    if (index < -1 || index >= parsedMoves.length) return;
    
    const newChess = new Chess();
    for (let i = 0; i <= index; i++) {
      try { newChess.move(parsedMoves[i]); } catch (e) {}
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
  }, [parsedMoves]);

  useEffect(() => {
    let timer;
    if (isPlaying && currentMoveIndex < parsedMoves.length - 1) {
      timer = setTimeout(() => goToMove(currentMoveIndex + 1), 1000);
    } else if (currentMoveIndex >= parsedMoves.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentMoveIndex, parsedMoves.length, goToMove]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
      
      {/* Chessboard Column */}
      <div style={{ background: 'var(--color-bg-alt)', padding: 'var(--space-4)', border: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Button variant="ghost" size="sm" onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')}>
             <RefreshCw size={14} /> FLIP BOARD
           </Button>
           <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-display)', fontSize: '12px' }}>
             <Activity size={14} color={showEval ? 'var(--color-green)' : 'var(--color-muted)'} />
             <input type="checkbox" checked={showEval} onChange={(e) => setShowEval(e.target.checked)} /> ENGINE
           </label>
        </div>

        {/* Top Player Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 32, height: 32, background: boardOrientation === 'white' ? 'var(--color-muted)' : 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
                {boardOrientation === 'white' ? match.black_id : match.white_id}
              </div>
              <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}>
                ({boardOrientation === 'white' ? match.black_rating : match.white_rating})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.4em', letterSpacing: '-0.1em' }}>
            {(boardOrientation === 'white' ? materialStats.wCaptured : materialStats.bCaptured).map((p, i) => (
              <span key={i}>{(boardOrientation === 'white' ? WHITE_PIECES_UNICODE : BLACK_PIECES_UNICODE)[p]}</span>
            ))}
            {(boardOrientation === 'white' ? materialStats.wAdvantage : materialStats.bAdvantage) > 0 && (
              <span style={{ fontSize: '0.5em', color: 'var(--color-muted)', marginLeft: 'var(--space-2)', fontFamily: 'var(--font-ui)', letterSpacing: '0' }}>
                +{(boardOrientation === 'white' ? materialStats.wAdvantage : materialStats.bAdvantage)}
              </span>
            )}
          </div>
        </div>

        <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%', maxWidth: '50vh', margin: '0 auto', display: 'flex' }}>
          {showEval && (
            <div style={{ width: '20px', height: '100%', background: 'var(--color-black)', marginRight: '10px', position: 'relative', border: '1px solid var(--color-black)' }}>
               {/* Extremely simple eval bar visualization */}
               <div style={{ 
                 position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'white',
                 height: `${Math.min(Math.max((parseFloat(evaluation.replace('+','').replace('M','50')) + 5) * 10, 0), 100)}%`,
                 transition: 'height 0.3s ease'
               }} />
            </div>
          )}
          <div style={{ flex: 1, position: 'relative' }}>
            <Chessboard 
              options={{
                position: fen,
                boardOrientation: boardOrientation,
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
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
          <Button variant="secondary" size="sm" onClick={() => goToMove(-1)} disabled={currentMoveIndex === -1}>
            <SkipBack size={16} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => goToMove(currentMoveIndex - 1)} disabled={currentMoveIndex === -1}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant={isPlaying ? "danger" : "primary"} size="sm" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => goToMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= parsedMoves.length - 1}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => goToMove(parsedMoves.length - 1)} disabled={currentMoveIndex >= parsedMoves.length - 1}>
            <SkipForward size={16} />
          </Button>
        </div>

        {/* Bottom Player Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 32, height: 32, background: boardOrientation === 'white' ? 'var(--color-primary)' : 'var(--color-muted)', borderRadius: 'var(--radius-sm)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
                {boardOrientation === 'white' ? match.white_id : match.black_id}
              </div>
              <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}>
                ({boardOrientation === 'white' ? match.white_rating : match.black_rating})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.4em', letterSpacing: '-0.1em' }}>
            {(boardOrientation === 'white' ? materialStats.bCaptured : materialStats.wCaptured).map((p, i) => (
              <span key={i}>{(boardOrientation === 'white' ? BLACK_PIECES_UNICODE : WHITE_PIECES_UNICODE)[p]}</span>
            ))}
            {(boardOrientation === 'white' ? materialStats.bAdvantage : materialStats.wAdvantage) > 0 && (
              <span style={{ fontSize: '0.5em', color: 'var(--color-muted)', marginLeft: 'var(--space-2)', fontFamily: 'var(--font-ui)', letterSpacing: '0' }}>
                +{(boardOrientation === 'white' ? materialStats.bAdvantage : materialStats.wAdvantage)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Info Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        
        {/* Stockfish Engine Module */}
        {showEval && (
          <div style={{ background: 'var(--color-bg-alt)', border: 'var(--border-thin)', padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
             <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-muted)' }}>STOCKFISH EVALUATION</div>
             <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: isCalculating ? 'var(--color-muted)' : 'var(--color-black)' }}>
                {evaluation}
             </div>
             <div style={{ fontFamily: 'var(--font-ui)', fontSize: '13px' }}>
                Best Move: <span style={{ background: 'var(--color-yellow)', padding: '2px 6px', fontWeight: 'bold', border: '1px solid var(--color-black)' }}>{bestMove || '...'}</span>
             </div>
             <div style={{ marginTop: 'var(--space-3)', borderTop: 'var(--border-thin)', paddingTop: 'var(--space-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
               <div style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: 'var(--color-bg)', padding: '6px', border: '1px solid var(--color-black)' }} title={fen.split(' ')[0]}>
                 FEN: {fen.split(' ')[0]}
               </div>
               <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(fen.split(' ')[0]); toast.success('FEN COPIED'); }} style={{ padding: '6px' }} title="Copy FEN">
                 <Copy size={12} />
               </Button>
             </div>
          </div>
        )}

        {/* Move List */}
        <div style={{ background: 'var(--color-bg-alt)', border: 'var(--border-thin)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '300px' }}>
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

      </div>
    </div>
  );
};

export default MatchReplay;
