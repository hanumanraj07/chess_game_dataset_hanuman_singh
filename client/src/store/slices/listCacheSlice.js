import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  matches: {},
  players: {},
  openings: {},
};

const listCacheSlice = createSlice({
  name: 'listCache',
  initialState,
  reducers: {
    setListCache: (state, action) => {
      const { namespace, key, items, totalCount } = action.payload;
      if (!state[namespace]) state[namespace] = {};
      state[namespace][key] = {
        items,
        totalCount,
        cachedAt: Date.now(),
      };
    },
    clearListCache: (state, action) => {
      const namespace = action.payload;
      if (namespace) {
        state[namespace] = {};
        return;
      }

      Object.keys(state).forEach((key) => {
        state[key] = {};
      });
    },
  },
});

export const { setListCache, clearListCache } = listCacheSlice.actions;
export default listCacheSlice.reducer;
