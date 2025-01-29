import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import AppBase from '../AppBase';
import Navbar from '../../components/Navbar';

import styles from './MobileLayout.module.scss';

function MobileLayout({ children, className }) {
  console.log('Styles loaded:', styles); // Temporary debug line
  
  return (
    <AppBase>
      <div className={classNames({
        [styles.container]: true,
        [className]: className
      })}> 
        <Navbar />
        {children}
      </div>
    </AppBase>
  );
}

MobileLayout.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

MobileLayout.defaultProps = {
  className: '',
  children: null,
};

export default MobileLayout;
