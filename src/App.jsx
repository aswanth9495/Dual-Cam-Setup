import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CaptureSnapshot from './components/CaptureSnapshot';
import SetupScreen from './components/SetupScreen';
import MobileLayout from './layouts/MobileLayout';
import { setConfigValues } from './store/config';
import { selectCameraStreamingState } from './store/camera';
import AppBase from './layouts/AppBase';

import './index.scss';

function DualCameraSetup() {
  const mainRoot = document.getElementById('root');
  let mainData = null;
  const dispatch = useDispatch();
  const { isStreaming, setupConfirmed } = useSelector(selectCameraStreamingState);
  // Dummy mainData for development/testing
  if (!mainData) {
    mainData = {
      test_id: '12345',
      test_slug: 'sample-test',
      test_session_id: '67890',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample_token'
    };
  }
  const {
    test_id: testId,
    test_slug: testSlug,
    test_session_id: testSessionId,
    token,
  } = mainData;

  /* useEffects */
  useEffect(() => {
    /* Set config values here */
    dispatch(setConfigValues({
      testId,
      testSlug,
      testSessionId,
      token,
    }));
  }, [dispatch, testId, testSessionId, testSlug, token]);

  if (isStreaming && setupConfirmed) {
    return (
      <AppBase>
        <CaptureSnapshot />
      </AppBase>
    );
  }

  return (
    <MobileLayout>
      <SetupScreen />
    </MobileLayout>
  );
}

export default DualCameraSetup;