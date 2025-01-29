import React, { useEffect, useCallback, useRef } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import CameraFeed from '../CameraFeed';
import Instructions from '../Instructions';
import Disclaimer from '../Disclaimer';
import { setSetupConfirmed, selectSetupScreenState } from '../../store/camera';
import { toast } from 'react-toastify';
import { ERROR_MESSAGES, eventTypeMapping } from '../../utils/constants';
import {
  useSendProctorEventMutation,
  useCheckOrientationMutation,
} from '../../services/dualCamProctoringService';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import styles from './SetupScreen.module.scss';
import { setConfigValues } from '../../store/config';

function SetupScreen({ onConfirm, className }) {
  const dispatch = useDispatch();
  const videoRef = useRef();
  const {
    isStreaming,
    testId,
    token,
  } = useSelector(selectSetupScreenState);

  const [
    sendProctorEvent,
    { isLoading }] = useSendProctorEventMutation();
  const [
    checkOrientation,
    {
      isLoading: isOrientationLoading,
    }] = useCheckOrientationMutation();

  // set setup confirm as false in case isStreaming is false
  useEffect(() => {
    if (!isStreaming) {
      dispatch(setSetupConfirmed(false));
    }
  }, [dispatch, isStreaming]);

  const handleConfirm = useCallback(async () => {
    // if video is being streamed set state
    if (!isStreaming) {
      toast.error(ERROR_MESSAGES.notStreaming);
      await sendProctorEvent({
        token,
        testId,
        eventName: eventTypeMapping.setupFail,
      });
    } else {
      try {
        // Take snapshot from video element
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Get blob from canvas
        const imageBlob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', 0.8);
        });
        const formData = new FormData();
        formData.append('image', imageBlob, 'captured_image.png');
        console.log('imageBlob', formData);

        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprintID = result.visitorId;

        const eventResult = await sendProctorEvent({
          token,
          testId,
          eventName: eventTypeMapping.setupSuccess,
          extraData: {
            value: fingerprintID,
          },
        });
        if (eventResult.error) {
          throw new Error(ERROR_MESSAGES.default);
        }

        const orientationResult = await checkOrientation({
          formData,
          token,
          testId,
        });
        console.log('orientationResult', orientationResult);
        if (orientationResult.error) {
          throw new Error(ERROR_MESSAGES.compatibilityCheckFailed);
        }
        dispatch(setConfigValues({ deviceFingerprint: fingerprintID }));
        dispatch(setSetupConfirmed(true));

        onConfirm?.(imageBlob); // Pass the image blob to the callback
      } catch (e) {
        toast.error(e.message);
      }
    }
  }, [checkOrientation,
    dispatch, isStreaming,
    onConfirm, sendProctorEvent, testId, token]);

  return (
    <div className={classNames(styles.container, { [className]: className })}>
      <header className={styles.header}>
        Dual Camera Setup
      </header>
      <CameraFeed ref={videoRef} />
      <Instructions />
      <Disclaimer
        disabled={isLoading || isOrientationLoading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

SetupScreen.propTypes = {
  className: PropTypes.string,
  // Other types here
};
export default SetupScreen;
