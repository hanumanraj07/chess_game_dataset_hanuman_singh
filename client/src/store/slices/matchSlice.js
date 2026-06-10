import { createSlice } from '@reduxjs/toolkit';

const matchSlice = createSlice({
  name: 'match',
  initialState: {
    matches: [],
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    filters: {},
    sortBy: '-createdAt',
    selectedMatch: null,
    loading: false,
    error: null,
  },
  reducers: {
    setMatches: (state, action) => {
      state.matches = action.payload.matches;
      state.totalCount = action.payload.totalCount;
    },
    setCurrentPage: (state, action) => { state.currentPage = action.payload; },
    setPageSize: (state, action) => { state.pageSize = action.payload; },
    setFilters: (state, action) => { state.filters = action.payload; state.currentPage = 1; },
    setSortBy: (state, action) => { state.sortBy = action.payload; },
    setSelectedMatch: (state, action) => { state.selectedMatch = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const {
  setMatches, setCurrentPage, setPageSize, setFilters,
  setSortBy, setSelectedMatch, setLoading, setError,
} = matchSlice.actions;
export default matchSlice.reducer;
