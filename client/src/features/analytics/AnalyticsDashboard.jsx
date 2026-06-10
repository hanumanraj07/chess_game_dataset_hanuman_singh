import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service.js';
import { ErrorState } from '../../components/ui/EmptyState.jsx';

const VICTORY_COLORS = ['#F5F2EB', '#1A6B3A', '#D4A017'];
const RESTYLE = {
  contentStyle: {
    background: 'var(--color-bg)', border: '4px solid var(--color-black)',
    borderRadius: 0, fontFamily: 'var(--font-display)', fontSize: 11, textTransform: 'uppercase',
  },
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 'var(--space-6)' }}>
    <h2 style={{
      fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-lg)',
      letterSpacing: '0.06em', marginBottom: 'var(--space-4)',
      paddingBottom: 'var(--space-3)', borderBottom: 'var(--border-thick)',
    }}>{title}</h2>
    {children}
  </div>
);

const AnalyticsDashboard = () => {
  const [victories, setVictories] = useState(null);
  const [openings, setOpenings] = useState([]);
  const [timeControl, setTimeControl] = useState([]);
  const [ratingDist, setRatingDist] = useState([]);
  const [ratingTrend, setRatingTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vicRes, colorRes, openRes, timeRes, distRes, trendRes] = await Promise.all([
        analyticsService.getVictories(),        // /analytics/victory-distribution (for draws)
        analyticsService.getColorAdvantage(),   // /analytics/color-advantage (for white/black wins)
        analyticsService.getOpenings(),         // /analytics/opening-success
        analyticsService.getTimeControlUsage(), // /analytics/time-control-usage
        analyticsService.getRatingDistribution(),
        analyticsService.getRatingTrend(),
      ]);
      
      // Server wraps: { success, message, data: { data: [ ... ] } }
      // Get draws from victory distribution
      const vicArray = vicRes.data?.data?.data ?? vicRes.data?.data ?? vicRes.data ?? [];
      const draw = Array.isArray(vicArray) ? (vicArray.find(v => v.status === 'draw' || v._id === 'draw')?.count || 0) : 0;

      // Get white/black wins from color advantage
      const colorArray = colorRes.data?.data?.data ?? colorRes.data?.data ?? colorRes.data ?? [];
      let white = 0, black = 0;
      if (Array.isArray(colorArray)) {
        white = colorArray.find(c => c.color === 'white' || c._id === 'white')?.count || 0;
        black = colorArray.find(c => c.color === 'black' || c._id === 'black')?.count || 0;
      }
        const total = white + black + draw;
        setVictories({
          whiteWins: white, blackWins: black, draws: draw,
          whiteWinPct: total ? (white / total) * 100 : 0,
          blackWinPct: total ? (black / total) * 100 : 0,
          drawPct: total ? (draw / total) * 100 : 0,
        });

      const openRaw = openRes.data?.data?.data ?? openRes.data?.data ?? openRes.data ?? [];
      const openList = Array.isArray(openRaw) ? openRaw : [];
      setOpenings(openList.slice(0, 10));

      const timeRaw = timeRes.data?.data?.data ?? timeRes.data?.data ?? timeRes.data ?? [];
      setTimeControl(Array.isArray(timeRaw) ? timeRaw.map(t => ({
        name: (t.timeClass || t.type || 'UNKNOWN').toUpperCase(),
        value: t.count || 0
      })) : []);

      const distRaw = distRes.data?.data?.data ?? distRes.data?.data ?? distRes.data ?? [];
      setRatingDist(Array.isArray(distRaw) ? distRaw : []);

      const trendRaw = trendRes.data?.data?.data ?? trendRes.data?.data ?? trendRes.data ?? [];
      setRatingTrend(Array.isArray(trendRaw) ? trendRaw : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const victoryData = victories ? [
    { name: 'WHITE WINS', value: victories.whiteWins || victories.white_wins || 0, pct: victories.whiteWinPct || 0 },
    { name: 'BLACK WINS', value: victories.blackWins || victories.black_wins || 0, pct: victories.blackWinPct || 0 },
    { name: 'DRAWS', value: victories.draws || 0, pct: victories.drawPct || 0 },
  ] : [];

  const openingChartData = openings.map((o) => {
    const total = o.total || o.totalGames || o.count || 1;
    return {
      name: (o.name || o.opening || '').slice(0, 16),
      white: Math.round(((o.whiteWins || 0) / total) * 100),
      black: Math.round(((o.blackWins || 0) / total) * 100),
    };
  });

  const timeControlData = timeControl.filter((t) => t.value > 0);

  const TIME_COLORS = ['#1A6B3A', '#2D8C50', '#D4A017', '#C0392B'];

  if (error) return <ErrorState title="ANALYTICS ERROR" message={error} onRetry={fetchAll} />;

  return (
    <>
      <Helmet>
        <title>Analytics | Chess Match Analytics</title>
        <meta name="description" content="Chess match analytics dashboard with charts and statistics" />
      </Helmet>

      <div className="page-header">
        <h1>Analytics</h1>
      </div>

      {/* Section 1: Victory Distribution */}
      <Section title="Match Outcomes">
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-title">Victory Distribution</div>
            {loading ? (
              <div className="skeleton" style={{ height: 220 }} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={victoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                    dataKey="value" strokeWidth={3} stroke="var(--color-black)">
                    {victoryData.map((_, i) => <Cell key={i} fill={VICTORY_COLORS[i]} />)}
                  </Pie>
                  <Tooltip {...RESTYLE} />
                  <Legend formatter={(v) => <span style={{ fontFamily: 'var(--font-display)', fontSize: 10 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="chart-container">
            <div className="chart-title">Outcome Stats</div>
            {loading ? (
              <div className="skeleton" style={{ height: 220 }} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
                {victoryData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 16, height: 16, background: VICTORY_COLORS[i], border: 'var(--border-thin)', flexShrink: 0 }} />
                    <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d.name}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{d.value.toLocaleString()}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', minWidth: 40, textAlign: 'right' }}>
                      {d.pct > 0 ? `${d.pct.toFixed(1)}%` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Section 2: Opening Analysis */}
      {openingChartData.length > 0 && (
        <Section title="Opening Success Rates">
          <div className="chart-container">
            <div className="chart-title">White vs Black Win Rate by Opening (Top 10)</div>
            {loading ? (
              <div className="skeleton" style={{ height: 300 }} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={openingChartData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontFamily: 'var(--font-display)', fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontFamily: 'var(--font-display)', fontSize: 9 }} />
                  <Tooltip {...RESTYLE} formatter={(v) => `${v}%`} />
                  <Legend formatter={(v) => <span style={{ fontFamily: 'var(--font-display)', fontSize: 10 }}>{v.toUpperCase()}</span>} />
                  <Bar dataKey="white" name="White Win%" fill="#F5F2EB" stroke="var(--color-black)" strokeWidth={2} radius={0} />
                  <Bar dataKey="black" name="Black Win%" fill="var(--color-green)" stroke="var(--color-black)" strokeWidth={2} radius={0} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>
      )}

      {/* Section 3: Rating Analysis */}
      <Section title="Rating Analysis">
        <div className="charts-grid">
          {ratingDist.length > 0 && (
            <div className="chart-container">
              <div className="chart-title">Rating Distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ratingDist}>
                  <XAxis dataKey="range" tick={{ fontFamily: 'var(--font-display)', fontSize: 9 }} />
                  <YAxis tick={{ fontFamily: 'var(--font-display)', fontSize: 9 }} />
                  <Tooltip {...RESTYLE} />
                  <Bar dataKey="count" fill="var(--color-green)" stroke="var(--color-black)" strokeWidth={2} radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {ratingTrend.length > 0 && (
            <div className="chart-container">
              <div className="chart-title">Average Rating Trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={ratingTrend}>
                  <XAxis dataKey="date" tick={{ fontFamily: 'var(--font-display)', fontSize: 9 }} />
                  <YAxis tick={{ fontFamily: 'var(--font-display)', fontSize: 9 }} />
                  <Tooltip {...RESTYLE} />
                  <Line type="linear" dataKey="avgRating" stroke="var(--color-green)" strokeWidth={2} dot={{ fill: 'var(--color-black)', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {ratingDist.length === 0 && ratingTrend.length === 0 && !loading && (
          <div style={{ padding: 'var(--space-5)', border: 'var(--border-thin)', textAlign: 'center', color: 'var(--color-muted)', fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>
            No Rating Data Available
          </div>
        )}
      </Section>

      {/* Section 4: Time Control */}
      {timeControlData.length > 0 && (
        <Section title="Time Control Breakdown">
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-title">Distribution by Time Control</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={timeControlData} cx="50%" cy="50%" outerRadius={90} dataKey="value" strokeWidth={3} stroke="var(--color-black)">
                    {timeControlData.map((_, i) => <Cell key={i} fill={TIME_COLORS[i % TIME_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...RESTYLE} />
                  <Legend formatter={(v) => <span style={{ fontFamily: 'var(--font-display)', fontSize: 10 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-container">
              <div className="chart-title">Counts</div>
              <div style={{ display: 'grid', gap: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
                {timeControlData.map((tc, i) => (
                  <div key={tc.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 12, height: 12, background: TIME_COLORS[i], border: 'var(--border-thin)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', flex: 1 }}>{tc.name}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{tc.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}
    </>
  );
};

export default AnalyticsDashboard;
