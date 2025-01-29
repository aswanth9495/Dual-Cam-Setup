import {
  applyMiddleware, combineReducers, compose, createStore,
} from 'redux';
import { thunk } from 'redux-thunk';

import cameraReducer from './camera';
import configReducer from './config';
import dualCamProctoringService from '../services/dualCamProctoringService';

const middleware = [
  thunk,
  dualCamProctoringService.middleware,
];

const reducers = combineReducers({
  camera: cameraReducer,
  config: configReducer,
  [dualCamProctoringService.reducerPath]: dualCamProctoringService.reducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
  }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...middleware),
  // other store enhancers if any
);

const store = createStore(reducers, enhancer);

export default store;
