import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { analyticsService } from '../../services/analytics.service.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';

const COLORS = ['#F2F2F2', '#0D0D0D', '#8C8C8C']; // White, Black, Draw (Brutalist theme colors)

const OpeningExplorer = () => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpenings = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getOpenings();
        const data = res?.data?.data || res?.data || [];
        
        // Transform data for charts
        const formatted = data.slice(0, 15).map(op => {
          const total = op.white_wins + op.black_wins + op.draws;
          return {
            name: op._id || 'Unknown',
            total,
            whiteWinPct: parseFloat(((op.white_wins / total) * 100).toFixed(1)),
            blackWinPct: parseFloat(((op.black_wins / total) * 100).toFixed(1)),
            drawPct: parseFloat(((op.draws / total) * 100).toFixed(1)),
            whiteWins: op.white_wins,
            blackWins: op.black_wins,
            draws: op.draws,
          };
        });
        
        setOpenings(formatted);
      } catch (err) {
        setError('Failed to load opening analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchOpenings();
  }, []);

  if (error) return <ErrorState title="ERROR LOADING OPENINGS" message={error} />;

  return (
    <>
      <Helmet>
        <title>Opening Explorer | Chess Match Analytics</title>
      </Helmet>

      <div className="page-header">
        <div>
          <h1>Opening Explorer</h1>
          <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', marginTop: '4px' }}>
            Deep dive into opening popularity and win rates.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        
        {/* WIN RATE CHART */}
        <div className="brutal-card">
          <h2 style={{ fontSize: 'var(--font-size-md)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            Win Rates by Opening (Top 15)
          </h2>
          <div style={{ height: 400, width: '100%' }}>
            {loading ? <Skeleton height="100%" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={openings} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} stroke="var(--color-muted)" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: 'var(--color-ink)' }} />
                  <RechartsTooltip 
                    contentStyle={{ background: 'var(--color-bg)', border: 'var(--border-thick)', borderRadius: 0, fontFamily: 'var(--font-ui)', color: 'var(--color-ink)' }}
                    formatter={(value, name) => [`${value}%`, name.replace('Pct', ' Rate').toUpperCase()]}
                  />
                  <Legend wrapperStyle={{ fontFamily: 'var(--font-ui)', fontSize: 12, paddingTop: 20 }} />
                  <Bar dataKey="whiteWinPct" name="White Win" stackId="a" fill="var(--color-white)" stroke="var(--color-black)" strokeWidth={1} />
                  <Bar dataKey="drawPct" name="Draw" stackId="a" fill="var(--color-muted)" stroke="var(--color-black)" strokeWidth={1} />
                  <Bar dataKey="blackWinPct" name="Black Win" stackId="a" fill="var(--color-black)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* POPULARITY PIE CHART */}
        <div className="brutal-card">
          <h2 style={{ fontSize: 'var(--font-size-md)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            Opening Popularity
          </h2>
          <div style={{ height: 400, width: '100%' }}>
            {loading ? <Skeleton height="100%" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={openings}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: 'var(--color-muted)' }}
                    stroke="var(--color-black)"
                    strokeWidth={2}
                  >
                    {openings.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['var(--color-green)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-ink)', 'var(--color-surface)'][index % 5]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: 'var(--color-bg)', border: 'var(--border-thick)', borderRadius: 0, fontFamily: 'var(--font-ui)', color: 'var(--color-ink)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OpeningExplorer;
