import React, { useState, useEffect, useRef  } from 'react';
import Carousel from './ImageCarousel';
import Aigent from './Aigent_with_carousel';
import styles from '../styles/Carousel_Aigent.module.css';
import { useChat } from '../contexts/ChatContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useImages } from '../contexts/CarouselImageContext';

const Carousel_Aigent = () => {
  const [isCarouselExpanded, setIsCarouselExpanded] = useState(true);
  const { carouselType, setCarouselType } = useChat();	
  const navigate = useNavigate();
  const location = useLocation();
  const carouselRef = useRef();
  const { loadMainImagesAndReset } = useImages();	
	
  const handleCollapse = () => {
    setIsCarouselExpanded(false);
  };

  const handleExpand = () => {
    setIsCarouselExpanded(true);
  };

  useEffect(() => {
    // Function to handle the back button event
    const handleBackButton = () => {
      setCarouselType('main');
    };

    // Listen for history changes
    const unlisten = () => {
      window.onpopstate = () => {
        handleBackButton();
      };
    };

    // Add the event listener when the component mounts
    unlisten();

    // Clean up the event listener when the component unmounts
    return () => {
      window.onpopstate = null;
    };
  }, [setCarouselType]);	
	

  const handleBackToCarousel = () => {
    setCarouselType('main');
	loadMainImagesAndReset();	  
    navigate('/carousel');
  };
	
  return (
    <div className={styles.ca_combinedContainer}>
      <div className={styles.backbuttonContainer}>
        <button onClick={handleBackToCarousel} className={styles.backButton}>Back to Carousel</button>
      </div>	  
	  
      {isCarouselExpanded ? (
        <div className={styles.ca_carouselContainer}>
          <Carousel onCollapse={handleCollapse} />
        </div>
      ) : (
        <div className={styles.ca_expandBar}>
          <button onClick={handleExpand} className={styles.ca_expandButton}>▼</button>
        </div>
      )}
      <div className={styles.ca_aigentContainer}>
        <Aigent onCollapse={handleCollapse} />
      </div>
    </div>
  );
};

export default Carousel_Aigent;
