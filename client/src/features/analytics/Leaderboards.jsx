import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trophy, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playerService } from '../../services/player.service.js';
import { analyticsService } from '../../services/analytics.service.js';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';

const Leaderboards = () => {
  const [topRated, setTopRated] = useState([]);
  const [topActive, setTopActive] = useState([]);
  const [giantSlayers, setGiantSlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ratedRes, activeRes, slayerRes] = await Promise.all([
          playerService.getTopRated(),
          playerService.getTopActive(),
          analyticsService.getRatingGapUpsets(),
        ]);

        const parseData = (res, key) => res?.data?.data?.[key] || res?.data?.[key] || [];

        setTopRated(parseData(ratedRes, 'players'));
        setTopActive(parseData(activeRes, 'players'));
        setGiantSlayers(parseData(slayerRes, 'data')); // Upsets are returned under 'data'
      } catch (err) {
        setError('Failed to load leaderboards. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return <ErrorState title="ERROR LOADING DATA" message={error} />;
  }

  return (
    <>
      <Helmet>
        <title>Leaderboards | Chess Match Analytics</title>
      </Helmet>

      <div className="page-header">
        <div>
          <h1>Global Leaderboards</h1>
          <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', marginTop: '4px' }}>
            Top ranked players, most active competitors, and biggest rating upsets.
          </p>
        </div>
      </div>

      <div className="leaderboard-grid">
        
        {/* TOP RATED */}
        <div className="brutal-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Trophy size={20} color="var(--color-warning)" />
            <h2 style={{ fontSize: 'var(--font-size-md)', textTransform: 'uppercase' }}>Highest Rated</h2>
          </div>
          <div className="brutal-table-wrapper">
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array(10).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton height={14} width={20} /></td>
                    <td><Skeleton height={14} width={100} /></td>
                    <td><Skeleton height={14} width={40} /></td>
                  </tr>
                )) : topRated.map((p, idx) => (
                  <tr key={p._id || idx}>
                    <td style={{ color: 'var(--color-muted)', fontWeight: 'bold' }}>#{idx + 1}</td>
                    <td>
                      <Link 
                        to={`/dashboard/player/${p.username}`} 
                        style={{ 
                          fontWeight: 'bold', color: 'var(--color-ink)', textDecoration: 'none',
                          display: 'block', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}
                        title={p.username}
                      >
                        {p.username}
                      </Link>
                    </td>
                    <td><Badge variant="black">{p.currentRating}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOST ACTIVE */}
        <div className="brutal-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Activity size={20} color="var(--color-green)" />
            <h2 style={{ fontSize: 'var(--font-size-md)', textTransform: 'uppercase' }}>Most Active</h2>
          </div>
          <div className="brutal-table-wrapper">
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Matches</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array(10).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton height={14} width={20} /></td>
                    <td><Skeleton height={14} width={100} /></td>
                    <td><Skeleton height={14} width={40} /></td>
                  </tr>
                )) : topActive.map((p, idx) => (
                  <tr key={p._id || idx}>
                    <td style={{ color: 'var(--color-muted)', fontWeight: 'bold' }}>#{idx + 1}</td>
                    <td>
                      <Link 
                        to={`/dashboard/player/${p.username}`} 
                        style={{ 
                          fontWeight: 'bold', color: 'var(--color-ink)', textDecoration: 'none',
                          display: 'block', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}
                        title={p.username}
                      >
                        {p.username}
                      </Link>
                    </td>
                    <td>{p.totalGames}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GIANT SLAYERS */}
        <div className="brutal-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Zap size={20} color="var(--color-danger)" />
            <h2 style={{ fontSize: 'var(--font-size-md)', textTransform: 'uppercase' }}>Giant Slayers</h2>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }}>
            Biggest rating difference upsets.
          </p>
          <div className="brutal-table-wrapper">
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>Winner</th>
                  <th>Loser</th>
                  <th>Diff</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array(10).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton height={14} width={60} /></td>
                    <td><Skeleton height={14} width={60} /></td>
                    <td><Skeleton height={14} width={30} /></td>
                  </tr>
                )) : giantSlayers.map((g, idx) => {
                  const winnerId = g.winner === 'white' ? g.white_id : g.black_id;
                  const loserId = g.winner === 'white' ? g.black_id : g.white_id;
                  return (
                    <tr key={idx}>
                      <td>
                        <Link 
                          to={`/dashboard/player/${winnerId}`} 
                          style={{ 
                            fontWeight: 'bold', color: 'var(--color-danger)', textDecoration: 'none',
                            display: 'block', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}
                          title={winnerId}
                        >
                          {winnerId}
                        </Link>
                      </td>
                      <td style={{ color: 'var(--color-muted)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={loserId}>
                        {loserId}
                      </td>
                      <td><Badge variant="outline">+{g.ratingGap}</Badge></td>
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

export default Leaderboards;
