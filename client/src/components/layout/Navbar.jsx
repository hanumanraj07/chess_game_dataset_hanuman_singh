import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, toggleTheme } from '../../store/slices/uiSlice.js';
import Badge from '../ui/Badge.jsx';
import toast from 'react-hot-toast';

const Navbar = ({ title }) => {
  const { user, isAdmin, logout } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((s) => s.ui.theme);

  const handleLogout = () => {
    logout();
    toast.success('LOGGED OUT SUCCESSFULLY');
    navigate('/login');
  };

  return (
    <header
      id="navbar"
      style={{
        height: 'var(--navbar-height)',
        background: 'var(--color-bg)',
        borderBottom: 'var(--border-brutal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          id="sidebar-toggle-btn"
          onClick={() => dispatch(toggleSidebar())}
          style={{
            background: 'none',
            border: 'var(--border-thick)',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-ink)',
          }}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-md)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-ink)',
            fontWeight: 700,
          }}
        >
          {title || 'Chess Analytics'}
        </h1>
      </div>

      {/* Right: theme toggle + user info + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={() => dispatch(toggleTheme())}
          style={{
            background: 'none',
            border: 'var(--border-thick)',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-ink)',
          }}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '4px 12px',
            border: 'var(--border-thin)',
            background: 'var(--color-surface)',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {user.username || user.email}
            </span>
            <Badge variant={isAdmin ? 'green' : 'outline'}>
              {isAdmin ? 'ADMIN' : 'USER'}
            </Badge>
          </div>
        )}

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <LogOut size={14} />
          LOGOUT
        </button>
      </div>
    </header>
  );
};

export default Navbar;
