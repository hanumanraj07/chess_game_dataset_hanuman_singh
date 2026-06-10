import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import uiReducer from './slices/uiSlice.js';
import matchReducer from './slices/matchSlice.js';
import playerReducer from './slices/playerSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    match: matchReducer,
    player: playerReducer,
  },
});
