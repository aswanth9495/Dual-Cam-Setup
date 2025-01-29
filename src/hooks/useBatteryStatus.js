/* eslint-disable no-param-reassign */
import { useCallback, useEffect, useState } from 'react';

const useBatteryStatus = ({
  threshold = 0.2,
  onBatteryLow, onBatteryNormal,
}) => {
  const [battery, setBattery] = useState(null);


  const handleBatteryStatus = useCallback((batteryManager) => {
    const { level, charging } = batteryManager;
    // battery level is a decimal (e.g., 0.2 for 20%)
    const isLow = level <= threshold && !charging;

    if (isLow && onBatteryLow && !batteryManager.__lowTriggered) {
      onBatteryLow?.(level);
      batteryManager.__lowTriggered = true;
      batteryManager.__normalTriggered = false;
    } else if (!isLow && onBatteryNormal && !batteryManager.__normalTriggered) {
      onBatteryNormal?.(level);
      batteryManager.__normalTriggered = true;
      batteryManager.__lowTriggered = false;
    }
  }, [onBatteryLow, onBatteryNormal, threshold]);

  useEffect(() => {
    let batteryManager;

    // Fetch the battery status
    const getBattery = async () => {
      try {
        batteryManager = await navigator.getBattery();
        setBattery(batteryManager);
        handleBatteryStatus(batteryManager);

        // Attach event listeners
        batteryManager.addEventListener(
          'levelchange', () => handleBatteryStatus(batteryManager),
        );
        batteryManager.addEventListener(
          'chargingchange', () => handleBatteryStatus(batteryManager),
        );
      } catch (error) {
        console.error('Battery Status API not supported', error);
      }
    };

    getBattery();

    // Clean up event listeners on unmount
    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener(
          'levelchange', handleBatteryStatus,
        );
        batteryManager.removeEventListener(
          'chargingchange', handleBatteryStatus,
        );
      }
    };
  }, [handleBatteryStatus, onBatteryLow, onBatteryNormal]);

  return battery;
};


export default useBatteryStatus;
