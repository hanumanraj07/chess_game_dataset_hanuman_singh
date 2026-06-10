import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDateTime } from '../../utils/formatters.js';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.data || res.data?.users || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await api.delete(`/admin/users/${deleteUser._id}`);
      toast.success('USER DELETED SUCCESSFULLY');
      setDeleteUser(null);
      fetchUsers();
    } catch {
      toast.error('FAILED TO DELETE USER');
    }
  };

  return (
    <>
      <Helmet>
        <title>User Management | Chess Match Analytics</title>
        <meta name="description" content="Admin user management" />
      </Helmet>

      <div className="page-header">
        <h1>User Management</h1>
        <Badge variant="danger">ADMIN ONLY</Badge>
      </div>

      {error && <ErrorState title="ACCESS ERROR" message={error} onRetry={fetchUsers} />}

      {!error && (
        <div className="brutal-table-wrapper">
          <table className="brutal-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(6).fill(0).map((__, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6}><EmptyState title="NO USERS FOUND" message="No registered users" /></td></tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u._id || idx}>
                    <td style={{ color: 'var(--color-muted)', fontSize: 10 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>{u.username}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{u.email}</td>
                    <td>
                      <Badge variant={u.role === 'admin' ? 'danger' : 'outline'}>{u.role?.toUpperCase() || 'USER'}</Badge>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>{formatDateTime(u.createdAt)}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => setDeleteUser(u)} id={`delete-user-${u._id}`}>
                        <Trash2 size={12} /> DELETE
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="DELETE USER?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteUser(null)}>CANCEL</Button>
            <Button variant="danger" onClick={handleDelete} id="confirm-user-delete-btn">CONFIRM DELETE</Button>
          </>
        }
      >
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
          Are you sure you want to permanently delete user <strong>{deleteUser?.username}</strong> ({deleteUser?.email})?
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default UsersManagement;
