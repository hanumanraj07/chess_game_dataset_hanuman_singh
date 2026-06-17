import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { playerService } from '../../services/player.service.js';
import api from '../../services/api.js';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import Button from '../../components/ui/Button.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';

const AutocompleteInput = ({ value, onChange, placeholder, id }) => {
  const [suggestions, setSuggestions] = React.useState([]);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (show && value.length >= 2) {
        try {
          const res = await api.get('/search/players', { params: { q: value } });
          const players = res.data?.data?.players || [];
          setSuggestions(players.slice(0, 6));
        } catch(e) { setSuggestions([]); }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, show]);

  return (
    <div style={{ position: 'relative' }}>
      <input 
        id={id}
        className="brutal-input" 
        value={value} 
        onChange={(e) => { onChange(e.target.value); setShow(true); }} 
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {show && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, 
          background: 'var(--color-bg-alt)', border: 'var(--border-thick)', 
          borderTop: 'none', zIndex: 10, boxShadow: 'var(--shadow-md)'
        }}>
          {suggestions.map(p => (
            <div 
              key={p._id} 
              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-surface)', fontFamily: 'var(--font-ui)' }}
              onMouseDown={(e) => { e.preventDefault(); onChange(p.username); setShow(false); }}
              onMouseEnter={(e) => { e.target.style.background = 'var(--color-green)'; e.target.style.color = 'var(--color-white)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'inherit'; }}
            >
              <div style={{ fontWeight: 'bold' }}>{p.username}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>Rating: {p.currentRating}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PlayerComparison = () => {
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleCompare = async (e) => {
    e?.preventDefault();
    if (!playerA || !playerB) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await playerService.compare(playerA, playerB);
      const comp = res?.data?.data?.comparison || res?.data?.comparison;
      
      if (!comp || !comp.player1 || !comp.player2) {
        throw new Error('Could not fetch player comparison.');
      }
      
      const p1 = comp.player1;
      const p2 = comp.player2;

      // Transform into Radar Chart format
      const radarData = [
        {
          metric: 'Current Rating',
          [p1.username]: p1.currentRating || p1.current_rating || 0,
          [p2.username]: p2.currentRating || p2.current_rating || 0,
          fullMark: Math.max(p1.currentRating || 0, p2.currentRating || 0) + 200,
        },
        {
          metric: 'Total Matches',
          [p1.username]: p1.totalGames || 0,
          [p2.username]: p2.totalGames || 0,
          fullMark: Math.max(p1.totalGames || 0, p2.totalGames || 0) + 10,
        },
        {
          metric: 'Win Rate %',
          [p1.username]: p1.totalGames ? parseFloat(((p1.wins / p1.totalGames) * 100).toFixed(1)) : 0,
          [p2.username]: p2.totalGames ? parseFloat(((p2.wins / p2.totalGames) * 100).toFixed(1)) : 0,
          fullMark: 100,
        },
        {
          metric: 'Loss Rate %',
          [p1.username]: p1.totalGames ? parseFloat(((p1.losses / p1.totalGames) * 100).toFixed(1)) : 0,
          [p2.username]: p2.totalGames ? parseFloat(((p2.losses / p2.totalGames) * 100).toFixed(1)) : 0,
          fullMark: 100,
        },
        {
          metric: 'Draw Rate %',
          [p1.username]: p1.totalGames ? parseFloat(((p1.draws / p1.totalGames) * 100).toFixed(1)) : 0,
          [p2.username]: p2.totalGames ? parseFloat(((p2.draws / p2.totalGames) * 100).toFixed(1)) : 0,
          fullMark: 100,
        }
      ];

      setData({ radarData, p1, p2 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Comparison failed. Check usernames.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Player Comparison | Chess Match Analytics</title>
      </Helmet>

      <div className="page-header">
        <div>
          <h1>Head-to-Head Comparison</h1>
          <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', marginTop: '4px' }}>
            Compare statistics between two players.
          </p>
        </div>
      </div>

      <div className="brutal-card" style={{ marginBottom: 'var(--space-6)', overflow: 'visible' }}>
        <form onSubmit={handleCompare} style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label" htmlFor="player-a">Player A Username</label>
            <AutocompleteInput 
              id="player-a"
              value={playerA} 
              onChange={setPlayerA} 
              placeholder="e.g. hikaru"
            />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold', paddingBottom: '10px' }}>VS</div>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label" htmlFor="player-b">Player B Username</label>
            <AutocompleteInput 
              id="player-b"
              value={playerB} 
              onChange={setPlayerB} 
              placeholder="e.g. magnus_carlsen"
            />
          </div>
          <Button type="submit" variant="primary" loading={loading} style={{ height: '46px' }}>
            COMPARE
          </Button>
        </form>
      </div>

      {error && <ErrorState title="COMPARISON FAILED" message={error} />}

      {!error && data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          
          {/* STATS OVERVIEW */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="brutal-card" style={{ borderLeft: '6px solid var(--color-green)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>{data.p1.username}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)' }}>
                <div><strong>Rating:</strong> {data.p1.currentRating || data.p1.current_rating || '—'}</div>
                <div><strong>Matches:</strong> {data.p1.totalGames}</div>
                <div><strong>Wins:</strong> {data.p1.wins}</div>
                <div><strong>Losses:</strong> {data.p1.losses}</div>
                <div><strong>Draws:</strong> {data.p1.draws}</div>
              </div>
            </div>

            <div className="brutal-card" style={{ borderLeft: '6px solid var(--color-danger)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>{data.p2.username}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)' }}>
                <div><strong>Rating:</strong> {data.p2.currentRating || data.p2.current_rating || '—'}</div>
                <div><strong>Matches:</strong> {data.p2.totalGames}</div>
                <div><strong>Wins:</strong> {data.p2.wins}</div>
                <div><strong>Losses:</strong> {data.p2.losses}</div>
                <div><strong>Draws:</strong> {data.p2.draws}</div>
              </div>
            </div>
          </div>

          {/* RADAR CHART */}
          <div className="brutal-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 'var(--font-size-md)', textTransform: 'uppercase', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
              Attribute Radar
            </h2>
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                  <PolarGrid stroke="var(--color-muted)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                  <Radar name={data.p1.username} dataKey={data.p1.username} stroke="var(--color-green)" fill="var(--color-green)" fillOpacity={0.4} strokeWidth={2} />
                  <Radar name={data.p2.username} dataKey={data.p2.username} stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontFamily: 'var(--font-ui)', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={{ background: 'var(--color-bg)', border: 'var(--border-thick)', borderRadius: 0, fontFamily: 'var(--font-ui)', color: 'var(--color-ink)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
};

export default PlayerComparison;
