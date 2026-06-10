import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Swords, Users, BookOpen, BarChart2,
  Search, ShieldCheck, User, Settings, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarOpen } from '../../store/slices/uiSlice.js';

const ICON_MAP = { LayoutDashboard, Swords, Users, BookOpen, BarChart2, Search, ShieldCheck, User, Settings };

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/matches', label: 'Matches', icon: 'Swords' },
  { path: '/players', label: 'Players', icon: 'Users' },
  { path: '/openings', label: 'Openings', icon: 'BookOpen' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart2' },
  { path: '/search', label: 'Search', icon: 'Search' },
];

const USER_NAV = [
  { path: '/profile', label: 'Profile', icon: 'User' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

const ADMIN_NAV = [
  { path: '/admin/users', label: 'User Mgmt', icon: 'ShieldCheck' },
];

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);
  const dispatch = useDispatch();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            display: 'none',
            position: 'fixed', inset: 0, background: 'rgba(13,13,13,0.5)',
            zIndex: 99,
          }}
          className="sidebar-overlay"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        id="sidebar"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--color-bg-alt)',
          borderRight: 'var(--border-brutal)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : 'calc(-1 * var(--sidebar-width))',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'left 150ms ease',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: 'var(--space-4)',
          borderBottom: 'var(--border-thick)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>♟</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-ink)',
            }}>
              Chess<br />Analytics
            </span>
          </NavLink>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'none' }}
            className="sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Nav */}
        <nav style={{ flex: 1, padding: 'var(--space-3) 0' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-muted)',
            padding: '8px 16px 4px',
          }}>
            Main
          </div>
          {NAV.map(({ path, label, icon }) => {
            const Icon = ICON_MAP[icon];
            return (
              <NavLink
                key={path}
                to={path}
                id={`nav-${label.toLowerCase()}`}
                className={({ isActive }) =>
                  `sidebar-nav-link${isActive ? ' sidebar-nav-active' : ''}`
                }
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-surface)',
                  borderLeft: isActive ? '6px solid var(--color-green)' : '6px solid transparent',
                  background: isActive ? 'var(--color-green)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-ink)',
                  transition: 'background 80ms ease, color 80ms ease',
                })}
              >
                {Icon && <Icon size={16} strokeWidth={2} />}
                {label}
              </NavLink>
            );
          })}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--color-muted)',
                padding: '16px 16px 4px',
                borderTop: 'var(--border-thin)',
                marginTop: 8,
              }}>
                Admin
              </div>
              {ADMIN_NAV.map(({ path, label, icon }) => {
                const Icon = ICON_MAP[icon];
                return (
                  <NavLink
                    key={path}
                    to={path}
                    id={`nav-admin-${label.toLowerCase().replace(' ', '-')}`}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--font-size-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--color-surface)',
                      borderLeft: isActive ? '6px solid var(--color-black)' : '6px solid transparent',
                      background: isActive ? 'var(--color-danger)' : 'transparent',
                      color: isActive ? 'var(--color-white)' : 'var(--color-danger)',
                    })}
                  >
                    {Icon && <Icon size={16} strokeWidth={2} />}
                    {label}
                  </NavLink>
                );
              })}
            </>
          )}

          {/* User section */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-muted)',
            padding: '16px 16px 4px',
            borderTop: 'var(--border-thin)',
            marginTop: 8,
          }}>
            Account
          </div>
          {USER_NAV.map(({ path, label, icon }) => {
            const Icon = ICON_MAP[icon];
            return (
              <NavLink
                key={path}
                to={path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-surface)',
                  borderLeft: isActive ? '6px solid var(--color-black)' : '6px solid transparent',
                  background: isActive ? 'var(--color-green)' : 'transparent',
                  color: isActive ? 'var(--color-white)' : 'var(--color-ink)',
                })}
              >
                {Icon && <Icon size={16} strokeWidth={2} />}
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Version footer */}
        <div style={{
          padding: 'var(--space-3)',
          borderTop: 'var(--border-thin)',
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          Chess Analytics v1.0
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }

        /* Sidebar nav link hover — uses theme tokens so dark mode works */
        .sidebar-nav-link:not(.sidebar-nav-active):hover {
          background: var(--color-hover-bg) !important;
          color: var(--color-hover-text) !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
