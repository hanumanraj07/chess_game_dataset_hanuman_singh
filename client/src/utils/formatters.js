export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const numDate = Number(dateStr);
  const d = new Date(isNaN(numDate) ? dateStr : numDate);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const numDate = Number(dateStr);
  const d = new Date(isNaN(numDate) ? dateStr : numDate);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatRating = (rating) => {
  if (!rating && rating !== 0) return '—';
  return Number(rating).toLocaleString();
};

export const formatResult = (result) => {
  if (!result) return '—';
  const map = { white: 'WHITE', black: 'BLACK', draw: 'DRAW' };
  return map[result.toLowerCase()] || result.toUpperCase();
};

export const formatWinRate = (rate) => {
  if (rate === null || rate === undefined) return '—';
  return `${Number(rate * 100).toFixed(1)}%`;
};

export const formatNumber = (n) => {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString();
};

export const truncate = (str, max = 30) => {
  if (!str) return '—';
  return str.length > max ? `${str.slice(0, max)}…` : str;
};

export const getResultBadgeClass = (result) => {
  if (!result) return 'badge-outline';
  const r = result.toLowerCase();
  if (r === 'white') return 'badge-outline';
  if (r === 'black') return 'badge-black';
  if (r === 'draw') return 'badge-warning';
  return 'badge-outline';
};
