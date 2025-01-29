import React, {
  useEffect, useMemo, useRef, useState,
  useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MonitorIcon from '../../images/monitor-fill.svg';
import { setIsStreaming } from '../../store/camera';
import {
  ERROR_MESSAGES, SNAPSHOT_PREFIX,
  eventTypeMapping,
} from '../../utils/constants';
import { checkBlackPixels } from '../../utils/image';
import S3Store from '../../utils/s3-store';
import {
  useSendProctorEventMutation,
} from '../../services/dualCamProctoringService';
import { useBatteryStatus, useScreenOn } from '../../hooks';


import styles from './CaptureSnapshot.module.scss';


const CaptureSnapshot = ({
  frequency = 3000,
  resizeOptions = { width: 640, height: 480 },
}) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const {
    deviceId,
    testId,
    testSessionId,
    token,
    deviceFingerprint,
    existingStream,
  } = useSelector((state) => ({
    deviceId: state.camera.cameraDeviceId,
    testId: state.config.testId,
    testSessionId: state.config.testSessionId,
    token: state.config.token,
    deviceFingerprint: state.config.deviceFingerprint,
    existingStream: state.camera.stream,
  }));
  const [
    sendProctorEvent,
  ] = useSendProctorEventMutation();


  const snapshotStore = useMemo(() => new S3Store(
    'us-west-2',
    'ib-assessment-tests',
    `${window.location.origin}/api/v3/assessments/${testId}/session/events/`,
  ), [testId]);
  const mode = window.ENV_VARS?.mode;

  // Function to generate the S3 URL
  // eslint-disable-next-line max-len
  const generateS3Url = useCallback((snapshotKey) => `s3://ib-assessment-tests/${mode}/${snapshotKey}`, [mode]);

  /* Handlers */
  const handleSnapshotSuccess = useCallback((blobData) => {
    try {
      const snapshotKey = [SNAPSHOT_PREFIX,
        testSessionId,
        `image_${Date.now()}.jpeg`].join('/');

      const snapshotParams = {
        Key: snapshotKey,
        ContentType: 'image/jpeg',
        Body: blobData,
      };

      snapshotStore.addPhoto(
        'mobile_snapshot',
        snapshotParams,
        token,
        () => {
          sendProctorEvent({
            deviceFingerprint,
            token,
            eventName: eventTypeMapping.snapshotSuccess,
            testId,
            extraData: {
              value: generateS3Url(
                snapshotKey,
              ), // Pass the URI instead of the Blob
            },
          });
        },
      );

      /* Uncomment this if we are sending Blob data */
      // Convert Blob to Base64 Data URL
      // const reader = new FileReader();
      // reader.onloadend = () => {
      //   const blobUri = reader.result; // This will be the base64 data URL
      //   // Send blobUri to the backend

      // };
      // reader.readAsDataURL(blobData);
    } catch (e) {
      console.log('%c⧭', 'color: #731d1d', 'Error in processing snapshot:', e);
    }
  }, [deviceFingerprint, generateS3Url,
    sendProctorEvent, snapshotStore, testId,
    testSessionId, token]);

  const handleSnapshotFailure = useCallback(() => {
    // Triggered when snapshot has failed
    sendProctorEvent({
      deviceFingerprint,
      token,
      eventName: eventTypeMapping.snapshotFailed,
      testId,
    });
  }, [deviceFingerprint, sendProctorEvent, testId, token]);

  useBatteryStatus({
    onBatteryLow: (level) => {
      sendProctorEvent({
        deviceFingerprint,
        token,
        eventName: eventTypeMapping.batteryLow,
        testId,
        extraData: {
          value: level * 100,
        },
      });
    },
    onBatteryNormal: (level) => {
      sendProctorEvent({
        deviceFingerprint,
        token,
        eventName: eventTypeMapping.batteryOk,
        testId,
        extraData: {
          value: level * 100,
        },
      });
    },
  });

  useScreenOn(
    {
      onScreenOffCallback: () => {
        sendProctorEvent({
          deviceFingerprint,
          token,
          eventName: eventTypeMapping.screenOff,
          testId,
        });
      },
      onScreenOnCallback: () => {
        sendProctorEvent({
          deviceFingerprint,
          token,
          eventName: eventTypeMapping.screenOn,
          testId,
        });
      },
    },
  );

  /* useEffects */
  // Clean up s3 store and stream when component unmounts
  useEffect(() => () => {
    snapshotStore.cleanup();
    // Clean up the stream when we're actually done with the camera
    if (existingStream) {
      existingStream.getTracks().forEach(track => track.stop());
      dispatch(setStream(null));
      dispatch(setIsStreaming(false));
    }
  }, [snapshotStore, existingStream, dispatch]);

  // Initialize camera stream
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        if (existingStream) {
          setStream(existingStream);
          if (videoRef.current) {
            videoRef.current.srcObject = existingStream;
          }
        }
      } catch (err) {
        setError(ERROR_MESSAGES.cameraAccess);
        dispatch(setIsStreaming(false));
        handleSnapshotFailure(err);
      }
    };

    initializeCamera();

    return () => {
      setStream(null);
    };
  }, [deviceId, dispatch, handleSnapshotFailure, existingStream]);

  // Capture snapshots at given frequency
  useEffect(() => {
    if (!stream) return;

    const captureSnapshot = async () => {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Draw the current video frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Check black pixels before resizing
        const blackPixelPercentage = checkBlackPixels(
          context,
          canvas.width,
          canvas.height,
        );

        if (blackPixelPercentage > 80) {
          throw new Error(
            ERROR_MESSAGES.imageTooDark,
          );
        }

        // Resize the image
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = resizeOptions.width;
        resizedCanvas.height = resizeOptions.height;
        const resizedContext = resizedCanvas.getContext('2d');

        resizedContext.drawImage(
          canvas,
          0, 0, canvas.width, canvas.height,
          0, 0, resizeOptions.width, resizeOptions.height,
        );

        // Convert to blob
        const blob = await new Promise(resolve => {
          resizedCanvas.toBlob(resolve, 'image/jpeg', 0.6);
        // Use JPEG with quality 0.6 for smaller file size
        });
        // Log the size of the blob (in bytes)
        const blobSizeInMB = (
          blob.size / (1024 * 1024)
        ).toFixed(2); // Convert bytes to MB and round to 2 decimal places
        console.log('Snapshot Blob Size:', blobSizeInMB, 'MB');

        handleSnapshotSuccess(blob);
      } catch (err) {
        handleSnapshotFailure?.(err);
      }
    };

    const intervalId = setInterval(captureSnapshot, frequency);

    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(intervalId);
    };
  }, [stream, frequency, resizeOptions, handleSnapshotSuccess,
    handleSnapshotFailure, dispatch]);

  if (error) {
    return (
      <div className={`${styles.container} ${styles.error}`}>
        Error Icon here
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={styles.videoFeed}
      />
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={resizeOptions.width}
        height={resizeOptions.height}
      />
      <div className={styles.content}>
        <div className={styles.iconSection}>
          <div className={styles.iconWrapper}>
            <img
              src={MonitorIcon}
              className={styles.icon}
              alt="monitor-icon"
            />
          </div>

          <div className={styles.statusBadge}>
            <div className={styles.statusDot} />
            Test Ongoing
          </div>
        </div>
        <h4 className="m-t-10 no-mgn-b normal">Mobile Successfully Paired</h4>
        <h1 className={styles.title}>
          Switch to desktop to start with the assessment
        </h1>

        <div className={styles.instructionsSection}>
          <h2 className={styles.instructionsTitle}>Important Instructions</h2>

          <ul className={styles.instructionsList}>
            <li>
              <span className={styles.instructionDetail}>
                Please
              </span>
              {' '}
              <span className={styles.instructionHighlight}>
                avoid switching tabs on your mobile,
              </span>
              {' '}
              <span className={styles.instructionDetail}>
                as it may pause the assessment by breaking the connection.
              </span>
            </li>

            <li>
              <span className={styles.instructionDetail}>
                Make sure your device is
              </span>
              {' '}
              <span className={styles.instructionHighlight}>
                connected with the internet
              </span>
              <span className={styles.instructionDetail}>
                {' '}
                during the test. Test will pause if connection breaks.
              </span>
            </li>

            <li>
              <span className={styles.instructionDetail}>Make sure to </span>
              <span className={styles.instructionHighlight}>
                charge your mobile
              </span>
              <span className={styles.instructionDetail}>
                {' '}
                to avoid disconnection
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CaptureSnapshot;
