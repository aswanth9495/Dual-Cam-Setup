/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import styles from './TroubleShoot.module.scss';

const CameraInstructions = () => (
  <div className={styles.instructionsContainer}>
    <div className={styles.header}>
      <h4 className={styles.title}>
        Camera Access Needed:
        Please follow the insructions below
      </h4>
    </div>
  </div>
);

export default CameraInstructions;
