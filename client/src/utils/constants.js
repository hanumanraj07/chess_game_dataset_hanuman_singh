export const BACKEND_URL = 'https://chess-dataset.onrender.com';
export const API_BASE = `${BACKEND_URL}/api/v1`;

export const GAME_TYPES = ['blitz', 'bullet', 'classical', 'correspondence'];
export const GAME_RESULTS = ['white', 'black', 'draw'];
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];
export const DEFAULT_PAGE_SIZE = 10;

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-turns', label: 'Most Turns' },
  { value: 'turns', label: 'Fewest Turns' },
];

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/matches', label: 'Matches', icon: 'Swords' },
  { path: '/players', label: 'Players', icon: 'Users' },
  { path: '/openings', label: 'Openings', icon: 'BookOpen' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart2' },
  { path: '/search', label: 'Search', icon: 'Search' },
];

export const ADMIN_NAV_ITEMS = [
  { path: '/admin/users', label: 'Users', icon: 'ShieldCheck' },
];
