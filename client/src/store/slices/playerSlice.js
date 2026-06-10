import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    players: [],
    selectedPlayer: null,
    loading: false,
    error: null,
  },
  reducers: {
    setPlayers: (state, action) => { state.players = action.payload; },
    setSelectedPlayer: (state, action) => { state.selectedPlayer = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setPlayers, setSelectedPlayer, setLoading, setError } = playerSlice.actions;
export default playerSlice.reducer;
