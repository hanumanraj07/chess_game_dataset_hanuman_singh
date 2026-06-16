import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import uiReducer from './slices/uiSlice.js';
import matchReducer from './slices/matchSlice.js';
import playerReducer from './slices/playerSlice.js';
import listCacheReducer from './slices/listCacheSlice.js';
import socketReducer from './slices/socketSlice.js';
import gameStateReducer from './slices/gameStateSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    match: matchReducer,
    player: playerReducer,
    listCache: listCacheReducer,
    socket: socketReducer,
    gameState: gameStateReducer,
  },
});
