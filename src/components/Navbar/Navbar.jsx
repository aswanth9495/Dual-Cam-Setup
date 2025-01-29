import React from 'react';
import styles from './Navbar.module.scss';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img
          // eslint-disable-next-line max-len
          src="https://assets.scaler.com/android/production/icons/company-logos/scaler.png"
          alt="Logo"
        />
      </div>
    </nav>
  );
}

export default Navbar;
