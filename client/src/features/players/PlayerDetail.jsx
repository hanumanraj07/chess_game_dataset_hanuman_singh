import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { playerService } from '../../services/player.service.js';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { formatDate } from '../../utils/formatters.js';

const COLORS = ['#1A6B3A', '#C0392B', '#D4A017'];

const PlayerDetail = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    playerService.getById(id)
      .then((res) => setPlayer(res.data?.data?.player ?? res.data?.player ?? res.data?.data ?? res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div>
      <Skeleton height={40} width="50%" />
      <div style={{ marginTop: 'var(--space-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Skeleton height={200} />
        <Skeleton height={200} />
      </div>
    </div>
  );

  if (error) return <ErrorState title="PLAYER NOT FOUND" message={error} />;
  if (!player) return null;

  const pieData = [
    { name: 'WINS', value: player.wins || 0 },
    { name: 'LOSSES', value: player.losses || 0 },
    { name: 'DRAWS', value: player.draws || 0 },
  ];

  const ratingHistory = player.ratingHistory || player.rating_history || [];
  const matchHistory = player.matches || player.matchHistory || [];

  return (
    <>
      <Helmet>
        <title>{player.username || 'Player'} | Chess Match Analytics</title>
      </Helmet>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/players" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> BACK</Link>
          <h1>{player.username || player.name || player._id}</h1>
          {player.giantSlayer && (
            <div style={{ background: 'var(--color-yellow)', color: 'var(--color-black)', padding: 'var(--space-1) var(--space-3)', border: '2px solid var(--color-black)', fontFamily: 'var(--font-display)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)', boxShadow: '2px 2px 0 var(--color-black)', marginLeft: 'auto' }}>
              🏆 GIANT SLAYER (+{player.maxUpsetDiff})
            </div>
          )}
        </div>
      </div>

      {player.giantSlayer && (
        <div style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-3)', border: '2px solid var(--color-black)', background: 'var(--color-bg)', boxShadow: '4px 4px 0 var(--color-black)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.2rem' }}>⚔️ BIGGEST UPSET</span>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--font-size-sm)' }}>
            Defeated <strong>{player.giantSlayer.white_id === player.username ? player.giantSlayer.black_id : player.giantSlayer.white_id}</strong> (Rating: {player.giantSlayer.white_id === player.username ? player.giantSlayer.black_rating : player.giantSlayer.white_rating}) as a {player.giantSlayer.white_id === player.username ? player.giantSlayer.white_rating : player.giantSlayer.black_rating} rated player.
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
        {[
          ['Total Games', player.totalGames || 0],
          ['Wins', player.wins || 0],
          ['Losses', player.losses || 0],
          ['Draws', player.draws || 0],
        ].map(([label, val]) => (
          <div key={label} className="stat-card">
            <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: 'var(--color-green)' }} />
            <div className="stat-label" style={{ paddingLeft: 'var(--space-3)' }}>{label}</div>
            <div className="stat-value" style={{ paddingLeft: 'var(--space-3)' }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {/* W/L/D Pie */}
        <div className="chart-container">
          <div className="chart-title">Win / Loss / Draw Breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" strokeWidth={3} stroke="var(--color-black)">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '4px solid var(--color-black)', borderRadius: 0, fontFamily: 'var(--font-display)', fontSize: 11 }} />
              <Legend formatter={(v) => <span style={{ fontFamily: 'var(--font-display)', fontSize: 10 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Rating History */}
        <div className="chart-container">
          <div className="chart-title">Rating History</div>
          {ratingHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ratingHistory}>
                <XAxis dataKey="date" tick={{ fontFamily: 'var(--font-display)', fontSize: 9 }} />
                <YAxis tick={{ fontFamily: 'var(--font-display)', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '4px solid var(--color-black)', borderRadius: 0, fontFamily: 'var(--font-display)', fontSize: 11 }} />
                <Line type="linear" dataKey="rating" stroke="var(--color-green)" strokeWidth={2} dot={{ fill: 'var(--color-black)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>
              No Rating History
            </div>
          )}
        </div>
        
        {/* Victory Status Breakdown */}
        {player.victoryStatus && (
          <div className="chart-container" style={{ gridColumn: '1 / -1' }}>
            <div className="chart-title">Win Conditions Breakdown</div>
            <div style={{ display: 'flex', height: 32, width: '100%', background: 'var(--color-bg-dark)', border: '2px solid var(--color-black)' }}>
              {[
                { label: 'Mate', value: player.victoryStatus.mate || 0, color: '#1A6B3A' },
                { label: 'Resign', value: player.victoryStatus.resign || 0, color: '#D4A017' },
                { label: 'Time Out', value: player.victoryStatus.outoftime || 0, color: '#C0392B' },
              ].filter(d => d.value > 0).map((d, i, arr) => {
                const totalWins = arr.reduce((acc, curr) => acc + curr.value, 0);
                return (
                  <div key={i} style={{ width: `${(d.value / totalWins) * 100}%`, background: d.color, borderRight: i < arr.length - 1 ? '2px solid var(--color-black)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }} title={`${d.label}: ${d.value}`}>
                    {(d.value / totalWins * 100).toFixed(0)}%
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', flexWrap: 'wrap' }}>
              {[
                { label: 'Mate', value: player.victoryStatus.mate || 0, color: '#1A6B3A' },
                { label: 'Resign', value: player.victoryStatus.resign || 0, color: '#D4A017' },
                { label: 'Time Out', value: player.victoryStatus.outoftime || 0, color: '#C0392B' },
              ].filter(d => d.value > 0).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{ width: 14, height: 14, background: d.color, border: '2px solid var(--color-black)' }} />
                  {d.label} ({d.value})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Match history */}
      {matchHistory.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)', letterSpacing: '0.06em' }}>Match History</h2>
          <div className="brutal-table-wrapper">
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>#</th><th>Opponent</th><th>Result</th><th>Turns</th><th>Opening</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {matchHistory.slice(0, 20).map((m, i) => {
                  const isWhite = m.white_id === player.username;
                  const opponent = isWhite ? m.black_id : m.white_id;
                  let result = 'DRAW';
                  if (m.winner !== 'draw') {
                    result = (isWhite && m.winner === 'white') || (!isWhite && m.winner === 'black') ? 'WIN' : 'LOSS';
                  }

                  return (
                    <tr key={m._id || i}>
                      <td>{i + 1}</td>
                      <td>{opponent || '—'}</td>
                      <td>{result}</td>
                      <td>{m.turns || '—'}</td>
                      <td>{m.opening_name || m.opening_eco || '—'}</td>
                      <td>{formatDate(m.created_at || m.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerDetail;
