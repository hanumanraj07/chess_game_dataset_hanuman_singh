import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const handleLogout = () => dispatch(logout());

  const isAdmin = user?.role === 'admin';

  return { user, token, isAuthenticated, loading, error, isAdmin, logout: handleLogout };
};
