import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomId: null,
  status: 'waiting', // waiting, active, completed, aborted
  mode: null,
  whitePlayer: null,
  blackPlayer: null,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn: '',
  moveHistory: [],
  whiteTimeMs: 0,
  blackTimeMs: 0,
  lastMoveTimestamp: null,
  turn: 'white',
  winner: null,
  terminationReason: null, // mate, resign, timeout, draw, abandon
  drawOfferBy: null, // 'white' or 'black'
  takebackOfferBy: null, // for AI/casual games
};

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    setGameRoom: (state, action) => {
      Object.assign(state, { ...initialState, ...action.payload });
    },
    updateGameState: (state, action) => {
      Object.assign(state, action.payload);
    },
    makeMoveState: (state, action) => {
      const { fen, pgn, turn, whiteTimeMs, blackTimeMs, lastMoveTimestamp } = action.payload;
      state.fen = fen;
      state.pgn = pgn;
      state.turn = turn;
      if (whiteTimeMs !== undefined) state.whiteTimeMs = whiteTimeMs;
      if (blackTimeMs !== undefined) state.blackTimeMs = blackTimeMs;
      if (lastMoveTimestamp) state.lastMoveTimestamp = lastMoveTimestamp;
    },
    setGameOver: (state, action) => {
      state.status = 'completed';
      state.winner = action.payload.winner;
      state.terminationReason = action.payload.reason;
    },
    leaveGameRoom: (state) => {
      Object.assign(state, initialState);
    }
  },
});

export const { setGameRoom, updateGameState, makeMoveState, setGameOver, leaveGameRoom } = gameStateSlice.actions;
export default gameStateSlice.reducer;
