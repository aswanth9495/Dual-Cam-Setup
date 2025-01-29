import React, { useState, useEffect } from 'react';
import referenceImage from '../../images/reference-image.png';

import styles from './Instructions.module.scss';

const DeviceInstructions = () => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    };

    checkDevice();
  }, []);

  return (
    <div className={styles.container}>
      <section className={styles.placementInstructions}>
        <header
          className={styles.header}
        >
          How to place your mobile phone camera?
        </header>
        <div className={styles.imageWrapper}>
          <img src={referenceImage} alt="reference" />
        </div>

        <article>
          Please ensure the view of your mobile phone is
          similar to how it is shown in the reference image.
        </article>
      </section>
      <h2 className={styles.title}>
        Camera Access Instructions
      </h2>

      {isIOS ? (
        <div className={styles.deviceSection}>
          <h3 className={styles.deviceTitle}>For iOS Users:</h3>
          <ol className={styles.instructionsList}>
            <li>
              <span className={styles.stepTitle}>Open Settings:</span>
              Launch the Settings app on your iPhone or iPad
            </li>
            <li>
              <span className={styles.stepTitle}>Find Your Browser:</span>
              Scroll down the list of apps and tap the name of your browser
              (e.g., Chrome, Safari, Firefox)
            </li>
            <li>
              <span className={styles.stepTitle}>Enable Camera Access:</span>
              <ul className={styles.subList}>
                <li>
                  Under the "Allow [Browser Name] to Access" section,
                  toggle the Camera option to on
                </li>
              </ul>
            </li>
          </ol>
        </div>
      ) : (
        <div className={styles.deviceSection}>
          <h3 className={styles.deviceTitle}>For Android Users:</h3>
          <ol className={styles.instructionsList}>
            <li>
              <span className={styles.stepTitle}>Go to Settings:</span>
              Tap the three-dot menu icon in the top-right corner
              of the browser and select Settings
            </li>
            <li>
              <span className={styles.stepTitle}>Site Settings:</span>
              Scroll down and tap Site settings
            </li>
            <li>
              <span className={styles.stepTitle}>Camera Access:</span>
              Tap Camera to manage permissions
            </li>
            <li>
              <span className={styles.stepTitle}>Enable Access:</span>
              Ensure the toggle for camera access is switched on
            </li>
            <li>
              <span className={styles.stepTitle}>Manage Blocked Sites:</span>
              If you see [https://www.scaler.com/] listed under "Blocked",
              tap the site and change the permission to "Allow"
            </li>
          </ol>

          <div className={styles.persistentIssues}>
            <h4 className={styles.issuesTitle}>If the problem persists:</h4>
            <ol className={styles.issuesList}>
              <li>
                <span className={styles.stepTitle}>
                  Check Android Permissions:
                </span>
                The camera might be blocked at the system level
              </li>
              <li>
                <span className={styles.stepTitle}>Open Android Settings:</span>
                From the Camera page in Chrome, tap Android settings
              </li>
              <li>
                <span className={styles.stepTitle}>
                  Manage App Permissions:
                </span>
                Go to App permissions
                {' '}
                {'>'}
                {' '}
                Camera and ensure your browser
                is set to "Allow"
              </li>
            </ol>
          </div>
        </div>
      )}

      <div className={styles.importantNote}>
        <h3 className={styles.noteTitle}>Important Note</h3>
        <p className={styles.noteText}>
          Please ensure your device meets the minimum requirements:
          {isIOS ? ' iOS 14+' : ' Android 5.0+'}
          {' '}
          with a working camera
          (either front or back).
        </p>
      </div>
    </div>
  );
};

export default DeviceInstructions;
