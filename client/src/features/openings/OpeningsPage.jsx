import { useEffect, useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { openingService } from '../../services/opening.service.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { usePagination } from '../../hooks/usePagination.js';
import Pagination from '../../components/ui/Pagination.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatNumber } from '../../utils/formatters.js';
import { setListCache } from '../../store/slices/listCacheSlice.js';

const OpeningsPage = () => {
  const dispatch = useDispatch();
  const [openings, setOpenings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [sortField, setSortField] = useState('total');
  const [sortDir, setSortDir] = useState(-1);

  const q = useDebounce(searchInput, 300);
  const { currentPage, pageSize, goToPage, reset } = usePagination(15);
  const cacheKey = useMemo(() => JSON.stringify({
    page: currentPage,
    limit: pageSize,
    q,
  }), [currentPage, pageSize, q]);
  const cachedOpenings = useSelector((state) => state.listCache.openings[cacheKey]);

  const fetchOpenings = useCallback(async () => {
    if (cachedOpenings) {
      setOpenings(cachedOpenings.items);
      setTotalCount(cachedOpenings.totalCount);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: pageSize };
      if (q) params.q = q;
      const res = await openingService.getAll(params);
      const data = res.data;
      // Server shape: { success, message, data: { openings: [] }, meta: { total, ... } }
      const openingList = data?.data?.openings ?? data?.openings ?? data?.data ?? [];
      const items = Array.isArray(openingList) ? openingList : [];
      const nextTotalCount = data?.meta?.total ?? data?.meta?.totalCount ?? data?.total ?? data?.totalCount ?? 0;
      setOpenings(items);
      setTotalCount(nextTotalCount);
      dispatch(setListCache({
        namespace: 'openings',
        key: cacheKey,
        items,
        totalCount: nextTotalCount,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, cachedOpenings, currentPage, dispatch, pageSize, q]);

  useEffect(() => { fetchOpenings(); }, [fetchOpenings]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => d * -1);
    else { setSortField(field); setSortDir(-1); }
  };

  const top10 = [...openings]
    .sort((a, b) => (b.total || b.totalGames || 0) - (a.total || a.totalGames || 0))
    .slice(0, 10)
    .map((o) => ({ name: (o.name || o.opening || '').slice(0, 18), games: o.total || o.totalGames || o.count || 0 }));

  const SortTh = ({ field, label, className }) => (
    <th className={`sortable-th ${className || ''}`} onClick={() => handleSort(field)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      {label} {sortField === field ? (sortDir === -1 ? '↓' : '↑') : ''}
    </th>
  );

  const sorted = [...openings].sort((a, b) => {
    const av = a[sortField] || 0;
    const bv = b[sortField] || 0;
    return sortDir * (typeof av === 'string' ? av.localeCompare(bv) : bv - av);
  });

  return (
    <>
      <Helmet>
        <title>Openings | Chess Match Analytics</title>
        <meta name="description" content="Chess openings analytics and win rate statistics" />
      </Helmet>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h1>Openings</h1>
        </div>
      </div>

      {/* Top openings chart */}
      {top10.length > 0 && (
        <div className="chart-container" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="chart-title">Top 10 Openings by Game Count</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top10} layout="vertical">
              <XAxis type="number" tick={{ fontFamily: 'var(--font-display)', fontSize: 10, fill: 'var(--color-muted)' }} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontFamily: 'var(--font-display)', fontSize: 9, fill: 'var(--color-ink)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '4px solid var(--color-black)', borderRadius: 0, fontFamily: 'var(--font-display)', fontSize: 11 }} />
              <Bar dataKey="games" fill="var(--color-green)" stroke="var(--color-black)" strokeWidth={2} radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Search */}
      <div className="filter-bar">
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            className="brutal-input"
            placeholder="SEARCH BY NAME OR ECO CODE…"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); reset(); }}
            style={{ paddingLeft: 32 }}
            id="opening-search-input"
          />
        </div>
      </div>

      {error && <ErrorState title="LOAD ERROR" message={error} onRetry={fetchOpenings} />}

      {!error && (
        <>
          <div className="brutal-table-wrapper">
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>#</th>
                  <SortTh field="eco" label="ECO" />
                  <SortTh field="name" label="Opening Name" />
                  <SortTh field="total" label="Total Games" />
                  <SortTh field="whiteWinRate" label="White Win%" className="hide-on-mobile" />
                  <SortTh field="blackWinRate" label="Black Win%" className="hide-on-mobile" />
                  <SortTh field="drawRate" label="Draw%" className="hide-on-mobile" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i}>{Array(7).fill(0).map((__, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
                  ))
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState title="NO OPENINGS FOUND" message="Try a different search" /></td></tr>
                ) : (
                  sorted.map((o, idx) => (
                    <tr key={o._id || idx}>
                      <td style={{ color: 'var(--color-muted)', fontSize: 10 }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-green)' }}>{o.eco || o.ECO || '—'}</td>
                      <td>{o.name || o.opening || '—'}</td>
                      <td style={{ fontWeight: 600 }}>{formatNumber(o.total || o.totalGames || o.count || 0)}</td>
                      <td className="hide-on-mobile">{
                        (o.total || o.totalGames || o.count) > 0 && o.whiteWins != null
                          ? `${((o.whiteWins / (o.total || o.totalGames || o.count)) * 100).toFixed(1)}%`
                          : (o.winRate?.white != null ? `${o.winRate.white.toFixed(1)}%` : '—')
                      }</td>
                      <td className="hide-on-mobile">{
                        (o.total || o.totalGames || o.count) > 0 && o.blackWins != null
                          ? `${((o.blackWins / (o.total || o.totalGames || o.count)) * 100).toFixed(1)}%`
                          : (o.winRate?.black != null ? `${o.winRate.black.toFixed(1)}%` : '—')
                      }</td>
                      <td className="hide-on-mobile">{
                        (o.total || o.totalGames || o.count) > 0 && o.draws != null
                          ? `${((o.draws / (o.total || o.totalGames || o.count)) * 100).toFixed(1)}%`
                          : (o.winRate?.draw != null ? `${o.winRate.draw.toFixed(1)}%` : '—')
                      }</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} totalCount={totalCount} pageSize={pageSize} />
        </>
      )}
    </>
  );
};

export default OpeningsPage;
