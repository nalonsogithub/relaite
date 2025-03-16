import React, { useState, useEffect } from 'react';
import Aigent_2 from './Aigent_2';
import RenderBinImageQGame from './RenderBinImageQGame';
import styles from '../styles/WrapperWithCarouselAndBinImageQGame.module.css';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'; 
//import { useChat } from '../contexts/ChatContext';
//import { useImages } from '../contexts/CarouselImageContext';
import { useNavigate } from 'react-router-dom';

const WrapperWithCarouselAndBinImageQGame = () => {
  const [showCarousel, setShowCarousel] = useState(true);
//  const { loadImageData } = useImages();
  const navigate = useNavigate();
  
  const toggleCarousel = () => {
    setShowCarousel(!showCarousel);
  };

  const collapseCarousel = () => {
    setShowCarousel(false);
  };
  
  const handleImageClick = (imageData, prompt = null, question = null) => {
    if (imageData.conversation_code.toLowerCase() === 'back') {
      navigate('/WrapperMainSiteCarousel');
    }
  };
	
  const goToCarousel = () => {
    navigate('/WrapperMainSiteCarousel');
  };	

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerContainer}>
	  	<div className={styles.headerComponentContainer}>
		  <div className={styles.header_left_container}>
			<button className={styles.returnButton} onClick={goToCarousel}>
			  ←
		    </button>
		  </div>
		  <div className={styles.header}>
		    <h1 className={styles.heading}>Home Details</h1>
		  </div>

		  <div className={styles.header_right_container}>
			 <button onClick={toggleCarousel} className={styles.toggleButton}>
			   {showCarousel ? <FaChevronUp /> : <FaChevronDown />} {/* Show the appropriate icon */}
			 </button>
		  </div>
	  	</div>
	  </div>

      {showCarousel && (
        <div className={styles.binQGameContainer}>
          <RenderBinImageQGame />
        </div>
      )}

      {/* Use different class depending on showCarousel state */}
      <div
        className={
          showCarousel ? styles.chatbotContainer : styles.chatbotContainer90
        }
      >
			{/* <Aigent_with_BinImageQGame collapseCarousel={collapseCarousel} /> */}
        <Aigent_2 maxHeight="100%" />
      </div>
    </div>
  );
};

export default WrapperWithCarouselAndBinImageQGame;
