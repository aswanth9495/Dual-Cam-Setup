import { createSlice } from '@reduxjs/toolkit';

const BASE_NAME = 'config';

const initialState = {
  testId: null,
  testSlug: null,
  testSessionId: null,
  token: null,
  deviceFingerprint: null,
};

const slice = createSlice({
  name: BASE_NAME,
  initialState,
  reducers: {
    setConfigValues: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },

});

export const {
  setConfigValues,
} = slice.actions;

export default slice.reducer;
