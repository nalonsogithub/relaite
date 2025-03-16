import React, { useState, useEffect } from 'react';
import ImageCarousel from './imageCarousel';
import Aigent_with_carousel from './Aigent_with_carousel';
import styles from '../styles/WrapperWithCarouselAndChatbot.module.css';
import { useChat } from '../contexts/ChatContext';
import { useImages } from '../contexts/CarouselImageContext';
import { useNavigate } from 'react-router-dom';

const WrapperWithCarouselAndChatbot = () => {
  const [showCarousel, setShowCarousel] = useState(true);
  const { carouselType, setCarouselType, isLoading } = useChat();
  const { loadImageData } = useImages();
  const { setQuestion, setPrompt, assistant, setAssistant } = useChat();	
  const navigate = useNavigate();

  useEffect(() => {
    if (carouselType !== 'detail') {
      setCarouselType('detail'); 
	  setAssistant('main');
    }
  }, [carouselType, setCarouselType, assistant, setAssistant]);
  
  const toggleCarousel = () => {
    setShowCarousel(!showCarousel);
  };

  const collapseCarousel = () => {
    setShowCarousel(false);
  };
  
  const handleImageClick = (imageData, prompt = null, question = null) => {
	if (isLoading) return;  
//    console.log('Image clicked:', imageData);
    if (imageData.conversation_code.toLowerCase() === 'back') {
//      console.log('Back to Home Clicked');
      setAssistant('main');
      setPrompt(prompt);
      setQuestion(question);
      navigate('/MainCarouselWrapper');
	} else if (prompt) {
//      console.log('Prompt:', prompt);
	  setAssistant('double_aigent');
      setPrompt(prompt);
      setQuestion(question);
    } else {
      console.log('No prompt provided');
    }
  };

  return (
    <div className={styles.wrapper}>
      {showCarousel && (
        <div className={styles.carouselContainer}>
          <ImageCarousel 
            width="40vw" 
            height="40vh" 
            showThumbnails={false} 
            onImageClick={handleImageClick}
	  		carouselType={carouselType}
          />
        </div>
      )}
      {!showCarousel && (
        <button onClick={toggleCarousel} className={styles.toggleButton}>Show Carousel</button>
      )}
      <div className={styles.chatbotContainer}>
        <Aigent_with_carousel collapseCarousel={collapseCarousel} />
      </div>
    </div>
  );
};

export default WrapperWithCarouselAndChatbot;
