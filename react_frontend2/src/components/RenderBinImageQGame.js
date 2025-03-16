import React, { useEffect, useState } from 'react';
import BinImageQGame from './BinImageQGame';
import styles from '../styles/RenderBinImageQGame.module.css';

const RenderBinImageQGame = ({ onImageChange, onAnswersSelected  }) => {

  // Handle user selections and pass them back to the parent
  const handleAnswersSelected = (question, answer) => {
//    console.log('User Selections From Render:', { question, answer });
    
    // Forward the selections to the parent component
    if (onAnswersSelected) {
      onAnswersSelected(question, answer);  // Pass question and answer up to the parent
    }
  };


  return (
    <div className={styles.centerContainer}>
      <div className={styles.floatingContainer}>
        <BinImageQGame
          containerHeight='100%'  
          containerWidth='90%'   
          onAnswersSelected={handleAnswersSelected}
	      onImageChange={onImageChange}
        />
      </div>
    </div>
  );
};

export default RenderBinImageQGame;
