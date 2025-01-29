import React, { useEffect, useState } from 'react';

const BatteryStatus = ({
  lowBatteryThreshold = 20,
  onBatteryCharging,
  onBatteryDischarging,
  onBatteryLow,
  onBatteryNormal,
}) => {
  const [battery, setBattery] = useState(null);

  useEffect(() => {
    let batteryManager = null;

    const handleBatteryChange = () => {
      if (!batteryManager) return;

      const { charging, level } = batteryManager;
      const percentage = Math.round(level * 100);

      if (charging && onBatteryCharging) {
        onBatteryCharging({ charging, level: percentage });
      }

      if (!charging && onBatteryDischarging) {
        onBatteryDischarging({ charging, level: percentage });
      }

      if (percentage <= lowBatteryThreshold && onBatteryLow) {
        onBatteryLow({ charging, level: percentage });
      }

      if (percentage > lowBatteryThreshold && onBatteryNormal) {
        onBatteryNormal({ charging, level: percentage });
      }
    };

    const initBattery = async () => {
      try {
        const batteryObj = await navigator.getBattery();
        batteryManager = batteryObj;
        setBattery(batteryObj);

        handleBatteryChange(); // Initial state

        batteryObj.addEventListener('chargingchange', handleBatteryChange);
        batteryObj.addEventListener('levelchange', handleBatteryChange);
      } catch (error) {
        console.error('Battery Status API not supported:', error);
      }
    };

    initBattery();

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener(
          'chargingchange', handleBatteryChange,
        );
        batteryManager.removeEventListener(
          'levelchange', handleBatteryChange,
        );
      }
    };
  }, [lowBatteryThreshold, onBatteryCharging,
    onBatteryDischarging, onBatteryLow, onBatteryNormal]);

  return (
    <div>
      {battery ? (
        <p>
          Battery status:
          {Math.round(battery.level * 100)}
          %
          {battery.charging ? 'Charging' : 'Discharging'}
        </p>
      ) : (
        <p>Battery status not available.</p>
      )}
    </div>
  );
};

export default BatteryStatus;
