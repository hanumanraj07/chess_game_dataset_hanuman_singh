import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { matchService } from '../../services/match.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDate, getResultBadgeClass, formatNumber } from '../../utils/formatters.js';

const matchSchema = Yup.object({
  white_id: Yup.string().required('White player required'),
  black_id: Yup.string().required('Black player required'),
  winner: Yup.string().oneOf(['white', 'black', 'draw']).required('Winner required'),
  turns: Yup.number().min(1).required('Turns required'),
});

const MatchesPage = () => {
  const { isAdmin } = useAuth();
  const [matches, setMatches] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ rated: '', type: '', winner: '' });
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [deleteMatch, setDeleteMatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const q = useDebounce(searchInput, 300);
  const { currentPage, pageSize, goToPage, reset } = usePagination(10);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: pageSize, sort: sortBy };
      if (q) params.q = q;
      if (filters.rated) params.rated = filters.rated;
      if (filters.type) params.type = filters.type;
      if (filters.winner) params.winner = filters.winner;

      const res = await matchService.getAll(params);
      const data = res.data;
      // Server response shape: { success, message, data: { matches: [] }, meta: { total, ... } }
      const matchList = data?.data?.matches ?? data?.matches ?? data?.data ?? [];
      setMatches(Array.isArray(matchList) ? matchList : []);
      setTotalCount(data?.meta?.total ?? data?.meta?.totalCount ?? data?.total ?? data?.totalCount ?? data?.count ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, q, filters]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleFilterChange = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    reset();
  };

  const handleDelete = async () => {
    if (!deleteMatch) return;
    try {
      await matchService.remove(deleteMatch._id);
      toast.success('MATCH DELETED SUCCESSFULLY');
      setDeleteMatch(null);
      fetchMatches();
    } catch (err) {
      toast.error('FAILED TO DELETE MATCH');
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      white_id: editMatch?.white_id || '',
      black_id: editMatch?.black_id || '',
      winner: editMatch?.winner || 'draw',
      turns: editMatch?.turns || '',
      rated: editMatch?.rated ?? true,
      time_increment: editMatch?.time_increment || '',
      opening_name: editMatch?.opening_name || '',
    },
    validationSchema: matchSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        if (editMatch) {
          await matchService.update(editMatch._id, values);
          toast.success('MATCH UPDATED SUCCESSFULLY');
          setEditMatch(null);
        } else {
          await matchService.create(values);
          toast.success('MATCH CREATED SUCCESSFULLY');
          setShowCreateModal(false);
        }
        fetchMatches();
      } catch (err) {
        toast.error(err.response?.data?.message?.toUpperCase() || 'OPERATION FAILED');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const MatchForm = () => (
    <form onSubmit={formik.handleSubmit} id="match-form">
      {[
        { name: 'white_id', label: 'White Player ID', type: 'text' },
        { name: 'black_id', label: 'Black Player ID', type: 'text' },
        { name: 'turns', label: 'Turns', type: 'number' },
        { name: 'time_increment', label: 'Time Increment', type: 'text' },
        { name: 'opening_name', label: 'Opening Name', type: 'text' },
      ].map(({ name, label, type }) => (
        <div key={name} className="form-group">
          <label className="form-label" htmlFor={`match-${name}`}>{label}</label>
          <input
            id={`match-${name}`}
            name={name}
            type={type}
            className={`brutal-input ${formik.touched[name] && formik.errors[name] ? 'error' : ''}`}
            {...formik.getFieldProps(name)}
          />
          {formik.touched[name] && formik.errors[name] && (
            <span className="form-error">{formik.errors[name]}</span>
          )}
        </div>
      ))}
      <div className="form-group">
        <label className="form-label" htmlFor="match-winner">Winner</label>
        <select id="match-winner" name="winner" className="brutal-select" {...formik.getFieldProps('winner')}>
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="draw">Draw</option>
        </select>
      </div>
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" name="rated" checked={formik.values.rated} onChange={formik.handleChange} />
          <span className="form-label" style={{ margin: 0 }}>Rated Game</span>
        </label>
      </div>
    </form>
  );

  return (
    <>
      <Helmet>
        <title>Match Records | Chess Match Analytics</title>
        <meta name="description" content="Browse, filter, and manage chess match records" />
      </Helmet>

      {/* Page header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h1>Match Records</h1>
          <span className="page-count">{formatNumber(totalCount)} TOTAL</span>
        </div>
        {isAdmin && (
          <Button id="add-match-btn" onClick={() => { setEditMatch(null); formik.resetForm(); setShowCreateModal(true); }}>
            <Plus size={14} /> ADD MATCH
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            className="brutal-input"
            placeholder="SEARCH MATCHES…"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); reset(); }}
            style={{ paddingLeft: 32 }}
            id="match-search-input"
          />
        </div>
        <select className="brutal-select" value={filters.rated} onChange={(e) => handleFilterChange('rated', e.target.value)} id="filter-rated">
          <option value="">ALL GAMES</option>
          <option value="true">RATED</option>
          <option value="false">CASUAL</option>
        </select>
        <select className="brutal-select" value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} id="filter-type">
          <option value="">ALL TYPES</option>
          <option value="blitz">BLITZ</option>
          <option value="bullet">BULLET</option>
          <option value="classical">CLASSICAL</option>
        </select>
        <select className="brutal-select" value={filters.winner} onChange={(e) => handleFilterChange('winner', e.target.value)} id="filter-winner">
          <option value="">ALL RESULTS</option>
          <option value="white">WHITE WIN</option>
          <option value="black">BLACK WIN</option>
          <option value="draw">DRAW</option>
        </select>
        <select className="brutal-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} id="sort-select">
          <option value="-createdAt">NEWEST FIRST</option>
          <option value="createdAt">OLDEST FIRST</option>
          <option value="-turns">MOST TURNS</option>
          <option value="turns">FEWEST TURNS</option>
        </select>
      </div>

      {/* Error */}
      {error && <ErrorState title="LOAD ERROR" message={error} onRetry={fetchMatches} />}

      {/* Table */}
      {!error && (
        <>
          <div className="brutal-table-wrapper">
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>White Player</th>
                  <th>White Rating</th>
                  <th>Black Player</th>
                  <th>Black Rating</th>
                  <th>Winner</th>
                  <th>Turns</th>
                  <th>Opening</th>
                  <th>Type</th>
                  <th>Rated</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(12).fill(0).map((__, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>
                      ))}
                    </tr>
                  ))
                ) : matches.length === 0 ? (
                  <tr>
                    <td colSpan={12}>
                      <EmptyState title="NO MATCHES FOUND" message={q ? `No results for "${q}"` : 'No matches in database'} />
                    </td>
                  </tr>
                ) : (
                  matches.map((m, idx) => (
                    <tr key={m._id || idx}>
                      <td style={{ color: 'var(--color-muted)', fontSize: 10 }}>
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td>{m.white_id || '—'}</td>
                      <td>{m.white_rating || '—'}</td>
                      <td>{m.black_id || '—'}</td>
                      <td>{m.black_rating || '—'}</td>
                      <td>
                        <Badge variant={getResultBadgeClass(m.winner).replace('badge-', '')}>
                          {m.winner?.toUpperCase() || '—'}
                        </Badge>
                      </td>
                      <td>{m.turns || '—'}</td>
                      <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.opening_eco ? `[${m.opening_eco}] ` : ''}{m.opening_name || m.opening || '—'}
                      </td>
                      <td>
                        <Badge variant="outline">{(m.increment_code || m.time_increment || m.type || '—').toUpperCase()}</Badge>
                      </td>
                      <td>
                        <Badge variant={m.rated === 'TRUE' || m.rated === true ? 'green' : 'outline'}>
                          {m.rated === 'TRUE' || m.rated === true ? 'YES' : 'NO'}
                        </Badge>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                        {formatDate(m.created_at || m.createdAt)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Link to={`/matches/${m._id}`} className="btn btn-ghost btn-sm" id={`view-match-${m._id}`} title="View">
                            <Eye size={12} />
                          </Link>
                          {isAdmin && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => { setEditMatch(m); setShowCreateModal(true); }}
                                id={`edit-match-${m._id}`}
                                title="Edit"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeleteMatch(m)}
                                id={`delete-match-${m._id}`}
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalCount={totalCount}
            pageSize={pageSize}
          />
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditMatch(null); formik.resetForm(); }}
        title={editMatch ? 'EDIT MATCH' : 'ADD NEW MATCH'}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setEditMatch(null); }}>
              CANCEL
            </Button>
            <Button type="submit" form="match-form" loading={submitting}>
              {editMatch ? 'UPDATE MATCH' : 'CREATE MATCH'}
            </Button>
          </>
        }
      >
        <MatchForm />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteMatch}
        onClose={() => setDeleteMatch(null)}
        title="DELETE THIS MATCH?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteMatch(null)} id="cancel-delete-btn">
              CANCEL
            </Button>
            <Button variant="danger" onClick={handleDelete} id="confirm-delete-btn">
              CONFIRM DELETE
            </Button>
          </>
        }
      >
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
          This action cannot be undone. Match between{' '}
          <strong>{deleteMatch?.white_id}</strong> vs <strong>{deleteMatch?.black_id}</strong> will be permanently deleted.
        </p>
      </Modal>
    </>
  );
};

export default MatchesPage;
