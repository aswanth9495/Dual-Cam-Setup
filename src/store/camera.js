import { createSlice, createSelector } from '@reduxjs/toolkit';

const BASE_NAME = 'camera';

const initialState = {
  cameraDeviceId: false,
  isStreaming: false,
  setupConfirmed: false,
  stream: null,
};

const slice = createSlice({
  name: BASE_NAME,
  initialState,
  reducers: {
    setCameraDeviceId: (state, action) => ({
      ...state,
      cameraDeviceId: action.payload,
    }),
    setIsStreaming: (state, action) => ({
      ...state,
      isStreaming: action.payload,
    }),
    setSetupConfirmed: (state, action) => ({
      ...state,
      setupConfirmed: action.payload,
    }),
    setStream: (state, action) => ({
      ...state,
      stream: action.payload,
    }),
  },

});

export const {
  setCameraDeviceId,
  setIsStreaming,
  setSetupConfirmed,
  setStream,
} = slice.actions;

export const selectCameraStreamingState = createSelector(
  state => state.camera.isStreaming,
  state => state.camera.setupConfirmed,
  (isStreaming, setupConfirmed) => ({
    isStreaming,
    setupConfirmed,
  })
);

export const selectSetupScreenState = createSelector(
  state => state.camera.isStreaming,
  state => state.config.testId,
  state => state.config.token,
  (isStreaming, testId, token) => ({
    isStreaming,
    testId,
    token,
  })
);

export const selectIsStreaming = createSelector(
  state => state.camera.isStreaming,
  isStreaming => ({ isStreaming })
);

export default slice.reducer;
