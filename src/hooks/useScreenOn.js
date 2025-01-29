/* eslint-disable no-console */
import { useEffect, useRef } from 'react';
import NoSleep from 'nosleep.js';

const useScreenOn = ({ onScreenOffCallback, onScreenOnCallback }) => {
  const noSleepRef = useRef(null);

  const enableNoSleep = () => {
    if (!noSleepRef.current) {
      noSleepRef.current = new NoSleep();
    }
    try {
      noSleepRef.current.enable();
    } catch (err) {
      console.error('Failed to enable NoSleep:', err);
    }
  };

  const disableNoSleep = () => {
    if (noSleepRef.current) {
      try {
        noSleepRef.current.disable();
      } catch (err) {
        console.error('Failed to disable NoSleep:', err);
      }
    }
  };

  useEffect(() => {
    // Enable NoSleep on mount
    enableNoSleep();

    // Set up visibility change listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && onScreenOffCallback) {
        onScreenOffCallback();
      } else if (document.visibilityState === 'visible' && onScreenOnCallback) {
        onScreenOnCallback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up on unmount
    return () => {
      disableNoSleep();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onScreenOffCallback, onScreenOnCallback]);

  return { enableNoSleep, disableNoSleep };
};

export default useScreenOn;
