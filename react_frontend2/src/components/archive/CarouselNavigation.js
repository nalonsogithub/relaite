import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/CarouselNavigation.module.css';

const CarouselNavigation = () => {
  const navigate = useNavigate();

  const goToMainCarousel = () => {
    navigate('/MainCarouselWrapper');
  };

  const goToChatbotCarousel = () => {
    navigate('/WrapperWithCarouselAndChatbot');
  };

  return (
    <div className={styles.navigationContainer}>
      <h1>Carousel Navigation</h1>
      <button onClick={goToMainCarousel} className={styles.navButton}>Go to Main Carousel</button>
      <button onClick={goToChatbotCarousel} className={styles.navButton}>Go to Chatbot Carousel</button>
    </div>
  );
};

export default CarouselNavigation;
