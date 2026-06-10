import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Trophy, Users, BookOpen, Database, Activity } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service.js';
import { matchService } from '../../services/match.service.js';
import { StatCard } from '../../components/ui/Card.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { formatDate, formatNumber, getResultBadgeClass } from '../../utils/formatters.js';
import api from '../../services/api.js';

import { BASE_URL } from '../../services/api.js';

const COLORS = ['#F5F2EB', '#1A6B3A', '#D4A017'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [victories, setVictories] = useState(null);
  const [openings, setOpenings] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [health, setHealth] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [matchesRes, playersRes, vicRes, colorRes, openRes, matchRes] = await Promise.all([
        analyticsService.getStats(),           // /stats/total-matches
        analyticsService.getTotalPlayers(),    // /stats/total-players
        analyticsService.getVictories(),       // /analytics/victory-distribution (for draws)
        analyticsService.getColorAdvantage(),  // /analytics/color-advantage (for white/black wins)
        analyticsService.getOpenings(),        // /analytics/opening-success
        matchService.getAll({ page: 1, limit: 10, sort: '-createdAt' }),
      ]);

      // Stats controller: apiResponse.success(res, msg, { data })
      // where data = { total: N } → full path: res.data.data.data.total
      const matchesData = matchesRes.data?.data?.data ?? matchesRes.data?.data ?? {};
      const playersData = playersRes.data?.data?.data ?? playersRes.data?.data ?? {};
      setStats({
        totalMatches: matchesData?.total ?? 0,
        totalPlayers: playersData?.total ?? 0,
      });

      // Get draws from victory distribution
      const vicArray = vicRes.data?.data?.data ?? vicRes.data?.data ?? vicRes.data ?? [];
      const drawCount = Array.isArray(vicArray) ? (vicArray.find(v => v.status === 'draw' || v._id === 'draw')?.count || 0) : 0;

      // Get white/black wins from color advantage
      const colorArray = colorRes.data?.data?.data ?? colorRes.data?.data ?? colorRes.data ?? [];
      let whiteCount = 0, blackCount = 0;
      if (Array.isArray(colorArray)) {
        whiteCount = colorArray.find(c => c.color === 'white' || c._id === 'white')?.count || 0;
        blackCount = colorArray.find(c => c.color === 'black' || c._id === 'black')?.count || 0;
      }

      setVictories({
        whiteWins: whiteCount,
        blackWins: blackCount,
        draws: drawCount,
      });

      // opening-success returns array: [{ name, eco, total, whiteWins, blackWins, draws, winRate }]
      // wrapped as: res.data.data.data = [ ... ]
      const openRaw = openRes.data?.data?.data ?? openRes.data?.data ?? openRes.data ?? [];
      const openList = Array.isArray(openRaw) ? openRaw : [];
      setOpenings(openList.slice(0, 5));

      // matches: res.data.data.matches = [ ... ]
      const matchList = matchRes.data?.data?.matches ?? matchRes.data?.matches ?? matchRes.data?.data ?? [];
      setRecentMatches(Array.isArray(matchList) ? matchList : []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      await api.get('/health');
      setHealth('online');
    } catch {
      setHealth('offline');
    }
  }, []);

  useEffect(() => {
    fetchAll();
    checkHealth();
    const healthInterval = setInterval(checkHealth, 30000);
    return () => clearInterval(healthInterval);
  }, [fetchAll, checkHealth]);

  const victoryChartData = victories ? [
    { name: 'WHITE WINS', value: victories.whiteWins || victories.white_wins || 0 },
    { name: 'BLACK WINS', value: victories.blackWins || victories.black_wins || 0 },
    { name: 'DRAWS', value: victories.draws || 0 },
  ] : [];

  const openingChartData = openings.map((o) => ({
    name: (o.name || o.opening || '').slice(0, 20),
    games: o.total || o.totalGames || o.count || o.games || 0,  // server returns 'total'
  }));

  return (
    <>
      <Helmet>
        <title>Dashboard | Chess Match Analytics</title>
        <meta name="description" content="Chess Match Analytics admin dashboard with stats and charts" />
      </Helmet>

      {/* Page Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="health-dot" style={{ width: 10, height: 10, borderRadius: '50%', display: 'inline-block', background: health === 'online' ? 'var(--color-green-light)' : health === 'offline' ? 'var(--color-danger)' : 'var(--color-warning)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>
            BACKEND: {health.toUpperCase()}
          </span>
        </div>
      </div>

      {error && <ErrorState title="DASHBOARD ERROR" message={error} onRetry={fetchAll} />}

      {/* Stat Cards */}
      <div className="stats-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Matches"
              value={formatNumber(stats?.totalMatches ?? 0)}
              icon={Trophy}
            />
            <StatCard
              label="Total Players"
              value={formatNumber(stats?.totalPlayers ?? 0)}
              icon={Users}
              accentColor="var(--color-green-mid)"
            />
            <StatCard
              label="Total Openings"
              value={formatNumber(openings.length > 0 ? openings.length : 0)}
              icon={BookOpen}
              accentColor="#D4A017"
            />
            <StatCard
              label="Database Records"
              value={formatNumber((stats?.totalMatches || 0) + (stats?.totalPlayers || 0))}
              icon={Database}
              accentColor="var(--color-danger)"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Victory Pie */}
        <div className="chart-container">
          <div className="chart-title">Victory Distribution</div>
          {loading ? (
            <div style={{ height: 200, background: 'var(--color-surface)' }} className="skeleton" />
          ) : victoryChartData.reduce((a, b) => a + b.value, 0) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={victoryChartData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  dataKey="value"
                  strokeWidth={3}
                  stroke="var(--color-black)"
                >
                  {victoryChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg)', border: '4px solid var(--color-black)',
                    borderRadius: 0, fontFamily: 'var(--font-display)', fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}
                />
                <Legend
                  iconType="square"
                  formatter={(val) => <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="NO DATA" message="No victory data available" />}
        </div>

        {/* Top Openings Bar */}
        <div className="chart-container">
          <div className="chart-title">Top 5 Openings by Usage</div>
          {loading ? (
            <div style={{ height: 200, background: 'var(--color-surface)' }} className="skeleton" />
          ) : openingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={openingChartData} layout="vertical">
                <XAxis type="number" tick={{ fontFamily: 'var(--font-display)', fontSize: 10, fill: 'var(--color-muted)' }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontFamily: 'var(--font-display)', fontSize: 9, fill: 'var(--color-ink)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg)', border: '4px solid var(--color-black)',
                    borderRadius: 0, fontFamily: 'var(--font-display)', fontSize: 11,
                  }}
                />
                <Bar dataKey="games" fill="var(--color-green)" stroke="var(--color-black)" strokeWidth={2} radius={0} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState title="NO DATA" message="No openings data available" />}
        </div>
      </div>

      {/* Recent Matches Table */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 'var(--space-3)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-lg)', letterSpacing: '0.06em' }}>
            Recent Matches
          </h2>
          <Link to="/matches" className="btn btn-secondary btn-sm" id="view-all-matches-link">
            VIEW ALL →
          </Link>
        </div>

        <div className="brutal-table-wrapper">
          <table className="brutal-table">
            <thead>
              <tr>
                <th>#</th>
                <th>White Player</th>
                <th>Black Player</th>
                <th>Winner</th>
                <th>Turns</th>
                <th>Opening</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((__, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>
                    ))}
                  </tr>
                ))
              ) : recentMatches.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-5)', color: 'var(--color-muted)' }}>No matches found</td></tr>
              ) : (
                recentMatches.map((m, idx) => (
                  <tr key={m._id || idx}>
                    <td style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)', fontSize: 10 }}>
                      {idx + 1}
                    </td>
                    <td>{m.white_id || m.whitePlayer || '—'}</td>
                    <td>{m.black_id || m.blackPlayer || '—'}</td>
                    <td>
                      <Badge variant={getResultBadgeClass(m.winner).replace('badge-', '')}>
                        {m.winner?.toUpperCase() || '—'}
                      </Badge>
                    </td>
                    <td>{m.turns || '—'}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.opening_name || m.opening || '—'}
                    </td>
                    <td>
                      <Badge variant="outline">{(m.increment_code || m.time_increment || m.timeControl || m.type || '—').toUpperCase()}</Badge>
                    </td>
                    <td style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}>
                      {formatDate(m.createdAt || m.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Status */}
      <div className="brutal-card" style={{ maxWidth: 400 }}>
        <div style={{ paddingLeft: 'var(--space-3)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: 8 }}>
            System Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Activity size={20} color={health === 'online' ? 'var(--color-green-light)' : 'var(--color-danger)'} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                Backend API
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                {BASE_URL.replace('https://', '').replace('http://', '').split('/')[0]}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Badge variant={health === 'online' ? 'green' : 'danger'}>
                {health.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
