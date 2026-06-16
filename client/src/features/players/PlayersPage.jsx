import { useEffect, useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, LayoutGrid, List } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { playerService } from '../../services/player.service.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { usePagination } from '../../hooks/usePagination.js';
import Pagination from '../../components/ui/Pagination.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { formatNumber } from '../../utils/formatters.js';
import { setListCache } from '../../store/slices/listCacheSlice.js';

const PlayersPage = () => {
  const dispatch = useDispatch();
  const [players, setPlayers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const q = useDebounce(searchInput, 300);
  const { currentPage, pageSize, goToPage, reset } = usePagination(12);
  const cacheKey = useMemo(() => JSON.stringify({
    page: currentPage,
    limit: pageSize,
    q,
  }), [currentPage, pageSize, q]);
  const cachedPlayers = useSelector((state) => state.listCache.players[cacheKey]);

  const fetchPlayers = useCallback(async () => {
    if (cachedPlayers) {
      setPlayers(cachedPlayers.items);
      setTotalCount(cachedPlayers.totalCount);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: pageSize };
      if (q) params.q = q;
      const res = await playerService.getAll(params);
      const data = res.data;
      const playerList = data?.data?.players ?? data?.players ?? data?.data ?? [];
      const items = Array.isArray(playerList) ? playerList : [];
      const nextTotalCount = data?.meta?.total ?? data?.meta?.totalCount ?? data?.total ?? data?.totalCount ?? 0;
      setPlayers(items);
      setTotalCount(nextTotalCount);
      dispatch(setListCache({
        namespace: 'players',
        key: cacheKey,
        items,
        totalCount: nextTotalCount,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, cachedPlayers, currentPage, dispatch, pageSize, q]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const PlayerCard = ({ player }) => (
    <Link
      to={`/players/${player._id}`}
      style={{ textDecoration: 'none' }}
      id={`player-card-${player._id}`}
    >
      <div
        style={{
          background: 'var(--color-bg-alt)',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-4)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(4px, 4px)'; e.currentTarget.style.boxShadow = 'none'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: 'var(--color-green)' }} />
        <div style={{ paddingLeft: 'var(--space-3)' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {player.username || player.name || player._id}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            {[
              ['Games', player.totalGames || player.games || 0],
              ['Wins', player.wins || 0],
              ['Avg Rating', player.currentRating || player.rating || '—'],
              ['Win Rate', player.totalGames > 0 ? `${((player.wins || 0) / player.totalGames * 100).toFixed(1)}%` : '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)',
          fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', color: 'var(--color-surface)',
        }}>♟</div>
      </div>
    </Link>
  );

  return (
    <>
      <Helmet>
        <title>Players | Chess Match Analytics</title>
        <meta name="description" content="Browse and search chess players" />
      </Helmet>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h1>Players</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('grid')}
            id="grid-view-btn"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('list')}
            id="list-view-btn"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            className="brutal-input"
            placeholder="SEARCH PLAYERS…"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); reset(); }}
            style={{ paddingLeft: 32 }}
            id="player-search-input"
          />
        </div>
      </div>

      {error && <ErrorState title="LOAD ERROR" message={error} onRetry={fetchPlayers} />}

      {!error && viewMode === 'grid' && (
        <div className="player-grid">
          {loading
            ? Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : players.length === 0
              ? <EmptyState title="NO PLAYERS FOUND" message="No players match your search" />
              : players.map((p) => <PlayerCard key={p._id} player={p} />)
          }
        </div>
      )}

      {!error && viewMode === 'list' && (
        <div className="brutal-table-wrapper">
          <table className="brutal-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Games</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Draws</th>
                <th>Avg Rating</th>
                <th>Win Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array(10).fill(0).map((_, i) => (
                <tr key={i}>{Array(9).fill(0).map((__, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
              )) : players.map((p, idx) => (
                <tr key={p._id}>
                  <td style={{ color: 'var(--color-muted)', fontSize: 10 }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.username || p.name || p._id}</td>
                  <td>{p.totalGames || p.games || 0}</td>
                  <td>{p.wins || 0}</td>
                  <td>{p.losses || 0}</td>
                  <td>{p.draws || 0}</td>
                  <td>{p.currentRating || p.rating || '—'}</td>
                  <td>{p.totalGames > 0 ? `${((p.wins || 0) / p.totalGames * 100).toFixed(1)}%` : '—'}</td>
                  <td>
                    <Link to={`/players/${p._id}`} className="btn btn-ghost btn-sm">VIEW →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} totalCount={totalCount} pageSize={pageSize} />
      )}
    </>
  );
};

export default PlayersPage;
