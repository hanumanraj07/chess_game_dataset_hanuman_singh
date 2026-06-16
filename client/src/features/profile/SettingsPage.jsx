import React, { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/uiSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Sun, Moon, LogOut } from 'lucide-react';

const PREF_KEY = 'chess_page_size';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((s) => s.ui.theme);
  const { user, logout } = useAuth();
  const [pageSize, setPageSize] = React.useState(() => parseInt(localStorage.getItem(PREF_KEY) || '10'));

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success('LOGGED OUT SUCCESSFULLY');
    navigate('/login');
  };

  const handlePageSize = (size) => {
    setPageSize(size);
    localStorage.setItem(PREF_KEY, size);
    toast.success(`DEFAULT PAGE SIZE SET TO ${size}`);
  };

  const Section = ({ title, children }) => (
    <div style={{ border: 'var(--border-brutal)', marginBottom: 'var(--space-5)', background: 'var(--color-bg-alt)' }}>
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: 'var(--border-thick)', background: 'var(--color-black)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-sm)', color: 'var(--color-bg)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: 'var(--space-4)' }}>{children}</div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Settings | Chess Match Analytics</title>
      </Helmet>

      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Theme */}
        <Section title="Appearance">
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
            Toggle between light (off-white) and dark mode. Preference is saved in localStorage.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              id="theme-light-btn"
              onClick={() => { if (theme !== 'light') dispatch(toggleTheme()); }}
              style={{
                flex: 1, padding: 'var(--space-4)', border: 'var(--border-brutal)',
                background: theme === 'light' ? 'var(--color-green)' : 'var(--color-bg-alt)',
                color: theme === 'light' ? 'var(--color-white)' : 'var(--color-ink)',
                cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <Sun size={24} />
              LIGHT MODE
            </button>
            <button
              id="theme-dark-btn"
              onClick={() => { if (theme !== 'dark') dispatch(toggleTheme()); }}
              style={{
                flex: 1, padding: 'var(--space-4)', border: 'var(--border-brutal)',
                background: theme === 'dark' ? 'var(--color-green)' : 'var(--color-bg-alt)',
                color: theme === 'dark' ? 'var(--color-white)' : 'var(--color-ink)',
                cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <Moon size={24} />
              DARK MODE
            </button>
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Default Items Per Page</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[10, 25, 50].map((n) => (
                <button
                  key={n}
                  id={`page-size-${n}-btn`}
                  onClick={() => handlePageSize(n)}
                  style={{
                    padding: '8px 20px',
                    border: 'var(--border-thick)',
                    background: pageSize === n ? 'var(--color-black)' : 'var(--color-bg)',
                    color: pageSize === n ? 'var(--color-bg)' : 'var(--color-ink)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Session */}
        <Section title="Session Info">
          <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            {[
              ['User', user?.username || '—'],
              ['Email', user?.email || '—'],
              ['Role', <Badge key="role" variant={user?.role === 'admin' ? 'green' : 'outline'}>{user?.role?.toUpperCase() || 'USER'}</Badge>],
              ['Token Status', <Badge key="token" variant="green">ACTIVE</Badge>],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: 'var(--border-thin)', background: 'var(--color-surface)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
          <Button variant="danger" onClick={() => setShowLogoutModal(true)} id="settings-logout-btn">
            <LogOut size={14} /> LOGOUT
          </Button>
        </Section>
      </div>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="CONFIRM LOGOUT"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)} id="settings-cancel-logout-btn">
              CANCEL
            </Button>
            <Button variant="danger" onClick={confirmLogout} id="settings-confirm-logout-btn">
              LOGOUT
            </Button>
          </>
        }
      >
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
          Are you sure you want to log out of your account?
        </p>
      </Modal>
    </>
  );
};

export default SettingsPage;
