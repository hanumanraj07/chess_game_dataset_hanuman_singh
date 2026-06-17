import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { playerService } from '../../services/player.service.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDate, getResultBadgeClass } from '../../utils/formatters.js';

const PersonalDashboard = () => {
  const { username } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const res = await playerService.getByUsername(username);
        
        // Safely extract the player object just like PlayerDetail.jsx
        const p = res.data?.data?.player ?? res.data?.player ?? res.data?.data ?? res.data;
        if (!p) throw new Error("Player data empty");

        setPlayer(p);
        
        // Extract stats from player object directly
        setStats({
          totalGames: p.totalGames || p.total_matches || 0,
          wins: p.wins || 0,
          losses: p.losses || 0,
          draws: p.draws || 0
        });
        
        // Format rating history
        const rawHistory = p.ratingHistory || [];
        const formattedHistory = rawHistory.map((item, idx) => ({
          match: idx + 1,
          date: formatDate(item.date || item.createdAt),
          rating: item.rating
        })).filter(h => h.rating != null);
        
        setRatingHistory(formattedHistory);
        
        // Extract recent matches
        const rawMatches = p.matchHistory || [];
        setRecentMatches(rawMatches.slice(0, 10));
        
      } catch (err) {
        console.error(err);
        setError('Failed to load player data. They may not exist.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayer();
  }, [username]);

  if (error) return <ErrorState title="PLAYER NOT FOUND" message={error} />;

  return (
    <>
      <Helmet>
        <title>{username ? `${username}'s Dashboard` : 'Player Dashboard'} | Chess Match Analytics</title>
      </Helmet>

      <div className="page-header">
        <div>
          <h1>{loading ? <Skeleton width={200} height={32} /> : `${username}'s Dashboard`}</h1>
          <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', marginTop: '4px' }}>
            Personal performance and rating history.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
        
        {/* STATS OVERVIEW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="stat-card">
            <div className="stat-label">Current Rating</div>
            <div className="stat-value">{loading ? <Skeleton width={60} /> : player?.currentRating || player?.current_rating || '—'}</div>
            <div className="stat-sub">Peak: {player?.maxRating || player?.max_rating || '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Matches</div>
            <div className="stat-value">{loading ? <Skeleton width={60} /> : stats?.totalGames || player?.totalGames || player?.total_matches || '0'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">
              {loading ? <Skeleton width={60} /> : (
                stats?.totalGames > 0 ? `${((stats.wins / stats.totalGames) * 100).toFixed(1)}%` : '0%'
              )}
            </div>
            <div className="stat-sub">W: {stats?.wins || 0} / L: {stats?.losses || 0} / D: {stats?.draws || 0}</div>
          </div>
        </div>

        {/* RATING TREND */}
        <div className="brutal-card">
          <h2 style={{ fontSize: 'var(--font-size-md)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            Rating History
          </h2>
          <div style={{ height: 350, width: '100%' }}>
            {loading ? <Skeleton height="100%" /> : ratingHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--color-ink)', fontSize: 10, fontFamily: 'var(--font-ui)' }} />
                  <RechartsTooltip 
                    contentStyle={{ background: 'var(--color-bg)', border: 'var(--border-thick)', borderRadius: 0, fontFamily: 'var(--font-ui)', color: 'var(--color-ink)' }}
                  />
                  <Line type="monotone" dataKey="rating" stroke="var(--color-green)" strokeWidth={3} dot={{ r: 3, fill: 'var(--color-bg)', stroke: 'var(--color-green)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-muted)' }}>
                No rating history available.
              </div>
            )}
          </div>
        </div>

        {/* RECENT MATCHES */}
        <div className="brutal-card">
          <h2 style={{ fontSize: 'var(--font-size-md)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            Recent Matches
          </h2>
          <div className="brutal-table-wrapper" style={{ overflow: 'hidden' }}>
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>Result</th>
                  <th>Opponent</th>
                  <th>Turns</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton height={14} width={40} /></td>
                    <td><Skeleton height={14} width={100} /></td>
                    <td><Skeleton height={14} width={30} /></td>
                    <td><Skeleton height={14} width={80} /></td>
                    <td><Skeleton height={14} width={40} /></td>
                  </tr>
                )) : recentMatches.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No recent matches found.</td></tr>
                ) : recentMatches.map((m) => {
                  const isWhite = m.white_id === username;
                  const opponent = isWhite ? m.black_id : m.white_id;
                  let resultStr = 'DRAW';
                  let badgeVar = 'outline';
                  if (m.winner === 'white' && isWhite) { resultStr = 'WIN'; badgeVar = 'green'; }
                  else if (m.winner === 'black' && !isWhite) { resultStr = 'WIN'; badgeVar = 'green'; }
                  else if (m.winner !== 'draw') { resultStr = 'LOSS'; badgeVar = 'danger'; }

                  return (
                    <tr key={m._id}>
                      <td><Badge variant={badgeVar}>{resultStr}</Badge></td>
                      <td>
                        <Link to={`/dashboard/player/${opponent}`} style={{ color: 'var(--color-ink)', textDecoration: 'none', fontWeight: 'bold' }}>
                          {opponent}
                        </Link>
                      </td>
                      <td>{m.turns}</td>
                      <td style={{ color: 'var(--color-muted)', fontSize: 10 }}>{formatDate(m.createdAt)}</td>
                      <td>
                        <Link to={`/matches/${m._id}`} className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 10 }}>
                          VIEW
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default PersonalDashboard;
