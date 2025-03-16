import React from 'react';
import TempImageCarousel from './TempImageCarousel';
import styles from '../styles/CarouselWrapper.module.css';

const CarouselWrapper = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>Home Buyer's Boutique</h1>
  	    <img src="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/REALESTaiTE_logo_1.gif" alt="Logo" className={styles.logo} />
      </div>
      <div className={styles.carousel}>
        <TempImageCarousel />
      </div>
      <div className={styles.footer}>
        <h2>Instructions:</h2>
        <p>Use the arrows or swipe to navigate through the images.</p>
        <p>Clicking on an image will start a conversation with your AIgent.</p>
      </div>
    </div>
  );
};

export default CarouselWrapper;
