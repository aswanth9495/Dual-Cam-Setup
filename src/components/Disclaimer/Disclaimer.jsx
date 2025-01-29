import React, { useState } from 'react';

import styles from './Disclaimer.module.scss';

function Disclaimer({ onConfirm, disabled = false }) {
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setDisclaimerChecked(event.target.checked);
  };

  const handleConfirm = () => {
    if (disclaimerChecked) {
      onConfirm();
    } else {
      alert('Please accept the disclaimer to proceed.');
    }
  };

  return (
    <section className={styles.disclaimer}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={disclaimerChecked}
          onChange={handleCheckboxChange}
          className={styles.checkbox}
        />
        I agree to the terms and conditions.
      </label>
      <button
        type="button"
        onClick={handleConfirm}
        className={`${styles.confirmButton} ${
          disclaimerChecked ? '' : styles.disabledButton
        }`}
        disabled={!disclaimerChecked || disabled}
      >
        Confirm & Proceed
      </button>
    </section>
  );
}

export default Disclaimer;
