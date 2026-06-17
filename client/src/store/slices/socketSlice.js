import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
  activeUsersCount: 0,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setActiveUsersCount: (state, action) => {
      state.activeUsersCount = action.payload;
    },
  },
});

export const { setConnected, setActiveUsersCount } = socketSlice.actions;
export default socketSlice.reducer;
