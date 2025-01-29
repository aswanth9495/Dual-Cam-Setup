import React, {
  useEffect, useRef, useState, forwardRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cameraSlashIcon from '../../images/camera-slash-fill.svg';
import { setIsStreaming, setStream, selectIsStreaming } from '../../store/camera';
import styles from './CameraFeed.module.scss';
import TroubleShoot from '../TroubleShoot';
import { toast } from 'react-toastify';

const CameraFeed = forwardRef((props, ref) => {
  const videoRef = useRef();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const currentFacingMode = 'user';

  const { isStreaming } = useSelector(selectIsStreaming);

  /**
   * Request Camera Permission
   */
  useEffect(() => {
    async function requestPermissions() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (error) {
        let message = 'Failed to access camera';

        if (error.name === 'NotAllowedError') {
          // eslint-disable-next-line max-len
          message = 'Camera permission denied. Please enable camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          message = 'No camera found on your device.';
        } else if (error.name === 'NotReadableError') {
          message = 'Camera is in use by another application.';
        } else if (error.name === 'SecurityError') {
          // eslint-disable-next-line max-len, no-unused-vars
          message = 'Camera access is restricted. Please ensure you are using HTTPS.';
        }
      }
    }

    requestPermissions();
  }, []);

  /**
   * Start Video Feed
   */
  useEffect(() => {
    if (videoRef.current) {
      const startVideo = async () => {
        try {
          setIsLoading(true);
          dispatch(setIsStreaming(false));

          // Stop any existing streams and wait for them to fully stop
          if (videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            const trackStopPromises = tracks.map(track => new Promise(
              resolve => {
                // eslint-disable-next-line no-param-reassign
                track.onended = resolve;
                track.stop();
              },
            ));

            // Wait for all tracks to stop
            await Promise.allSettled(trackStopPromises);
            videoRef.current.srcObject = null;
            dispatch(setStream(null));
          }

          await new Promise(resolve => setTimeout(resolve, 2000));

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: currentFacingMode,
            },
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            dispatch(setStream(stream));
            videoRef.current.onloadedmetadata = () => {
              dispatch(setIsStreaming(true));
              setIsLoading(false);
            };
          }
        } catch (error) {
          console.error('Stream error:', error);
          let message = 'Failed to start camera stream';

          if (error.name === 'NotAllowedError') {
            message = 'Camera permission denied';
          } else if (error.name === 'NotFoundError') {
            message = 'Selected camera not found';
          } else if (error.name === 'NotReadableError') {
            message = currentFacingMode === 'environment'
              // eslint-disable-next-line max-len
              ? 'Unable to access rear camera. Please ensure no other apps are using it and try again. If the issue persists, try using the front camera.'
              : 'Camera is in use by another application';
          }

          toast.error(message);
        } finally {
          setIsLoading(false);
        }
      };

      startVideo();

      return undefined;
    }
    return undefined;
  }, [currentFacingMode, dispatch]);

  // Forward the ref to the video element
  useEffect(() => {
    if (ref) {
      // eslint-disable-next-line no-param-reassign
      ref.current = videoRef.current;
    }
  }, [ref]);

  return (
    <>
      <section className={styles.cameraFeed}>
        <header className={styles.header}>
          Mobile Camera Setup in Progress...
        </header>
        <section className={styles.selectCamera}>
          <video
            ref={videoRef}
            className={styles.videoFeed}
            style={!isStreaming ? { display: 'none' } : {}}
            autoPlay
            playsInline
            muted
          />
          {!isStreaming && !isLoading && (
            <div className={styles.noVideo}>
              <img
                src={cameraSlashIcon}
                alt="no-video"
                className={styles.noVideoIcon}
              />
            </div>
          )}
          {isLoading && (
            <div className={styles.loader}>
              <div className={styles.spinnerBorder} role="status">
                <span className={styles.srOnly}>Loading...</span>
              </div>
            </div>
          )}
        </section>
      </section>
      {!isStreaming && !isLoading && <TroubleShoot />}
    </>
  );
});

CameraFeed.displayName = 'CameraFeed';

export default CameraFeed;
