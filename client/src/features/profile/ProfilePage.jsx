import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { jwtDecode } from 'jwt-decode';

const ProfilePage = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  let tokenExp = null;
  try {
    const token = localStorage.getItem('chess_auth_token');
    if (token) {
      const decoded = jwtDecode(token);
      tokenExp = new Date(decoded.exp * 1000).toLocaleString();
    }
  } catch { /* ignore */ }

  const formik = useFormik({
    initialValues: { username: user?.username || '', email: user?.email || '' },
    validationSchema: Yup.object({
      username: Yup.string().min(3).required('Username required'),
      email: Yup.string().email().required('Email required'),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 600));
      toast.success('PROFILE UPDATED — BACKEND ENDPOINT PENDING');
      setEditMode(false);
      setSubmitting(false);
    },
  });

  return (
    <>
      <Helmet>
        <title>Profile | Chess Match Analytics</title>
      </Helmet>

      <div className="page-header">
        <h1>Profile</h1>
        <Badge variant={user?.role === 'admin' ? 'green' : 'outline'}>{user?.role?.toUpperCase() || 'USER'}</Badge>
      </div>

      <div style={{ maxWidth: 600 }}>
        {/* User info card */}
        <div className="brutal-card" style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ paddingLeft: 'var(--space-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 'var(--space-3)' }}>♟</div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 4 }}>{user?.username}</h2>
            <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>{user?.email}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              {[
                ['User ID', user?.id || user?._id || '—'],
                ['Role', user?.role?.toUpperCase() || 'USER'],
                ['Account Created', formatDateTime(user?.createdAt)],
                ['Token Expires', tokenExp || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ padding: '10px 12px', border: 'var(--border-thin)', background: 'var(--color-surface)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', wordBreak: 'break-all' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div style={{ border: 'var(--border-brutal)', background: 'var(--color-bg-alt)', marginBottom: 'var(--space-5)' }}>
          <div style={{ padding: 'var(--space-4)', borderBottom: 'var(--border-thick)', background: 'var(--color-black)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', color: 'var(--color-bg)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Edit Profile
            </h3>
          </div>
          <div style={{ padding: 'var(--space-4)' }}>
            {editMode ? (
              <form onSubmit={formik.handleSubmit} id="profile-form">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className={`brutal-input ${formik.errors.username ? 'error' : ''}`} {...formik.getFieldProps('username')} />
                  {formik.errors.username && <span className="form-error">{formik.errors.username}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className={`brutal-input ${formik.errors.email ? 'error' : ''}`} {...formik.getFieldProps('email')} />
                  {formik.errors.email && <span className="form-error">{formik.errors.email}</span>}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <Button type="submit" loading={submitting} id="save-profile-btn">SAVE CHANGES</Button>
                  <Button variant="secondary" onClick={() => setEditMode(false)}>CANCEL</Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setEditMode(true)} id="edit-profile-btn">EDIT PROFILE</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
