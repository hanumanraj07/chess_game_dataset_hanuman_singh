import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/matches': 'Match Records',
  '/players': 'Players',
  '/openings': 'Openings',
  '/analytics': 'Analytics',
  '/search': 'Search',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/admin/users': 'User Management',
};

const DashboardLayout = () => {
  const location = useLocation();
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);
  const theme = useSelector((s) => s.ui.theme);

  const title = PAGE_TITLES[location.pathname] || 'Chess Analytics';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />

      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0,
        transition: 'margin-left 150ms ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <Navbar title={title} />

        <main style={{
          flex: 1,
          padding: 'var(--space-5)',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'brutal-toast',
          duration: 3000,
          style: {
            fontFamily: 'var(--font-display)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderRadius: 0,
            border: '4px solid var(--color-border)',
            boxShadow: '6px 6px 0px var(--color-black)',
            background: 'var(--color-bg)',
            color: 'var(--color-ink)',
          },
        }}
      />
    </div>
  );
};

export default DashboardLayout;
