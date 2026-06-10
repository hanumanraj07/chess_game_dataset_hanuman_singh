import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service.js';
import { jwtDecode } from 'jwt-decode';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await authService.login(credentials);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

const getInitialUser = () => {
  try {
    const token = localStorage.getItem('chess_auth_token');
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        return {
          user: JSON.parse(localStorage.getItem('chess_user') || 'null'),
          token,
          isAuthenticated: true,
        };
      }
    }
  } catch { /* ignore */ }
  return { user: null, token: null, isAuthenticated: false };
};

const initial = getInitialUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initial.user,
    token: initial.token,
    isAuthenticated: initial.isAuthenticated,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('chess_auth_token');
      localStorage.removeItem('chess_user');
    },
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleSuccess = (state, action) => {
      state.loading = false;
      // Server response shape: { success, message, data: { user, accessToken, refreshToken } }
      const { user, accessToken } = action.payload?.data || action.payload;
      const token = accessToken;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      if (token) {
        localStorage.setItem('chess_auth_token', token);
        localStorage.setItem('chess_user', JSON.stringify(user));
      }
    };
    const handleReject = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    builder
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleSuccess)
      .addCase(loginUser.rejected, handleReject)
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, handleSuccess)
      .addCase(registerUser.rejected, handleReject);
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
