import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from '../styles/TempImageCarousel.module.css';
import { useImages } from '../contexts/CarouselImageContext';
import { useChat } from '../contexts/ChatContext'; // Import useChat hook

const TempImageCarousel = ({ width, height, showThumbnails, onImageClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const { images } = useImages();
  const { setConversationDescriptionList } = useChat(); // Destructure setConversationDescriptionList from useChat

  const settingsMain = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '10px',
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    beforeChange: (current, next) => {
      setCurrentSlide(next);
      const description = images[next]?.conversation_description || "Click on an image to start a conversation.";
      console.log('Setting conversation description:', description);
      setConversationDescriptionList([description]); // Ensure it's an array
    },
    nextArrow: <div className={styles.nextArrow}>→</div>,
    prevArrow: <div className={styles.prevArrow}>←</div>,
  };

  const settingsThumbs = {
    slidesToShow: Math.min(images.length, 5),
    slidesToScroll: 1,
    dots: false,
    infinite: false,
    centerMode: false,
    focusOnSelect: true,
  };

  const handleImageClick = (event, index) => {
    const image = images[index];
    const prompt = image.opening_prompt_1;
    if (onImageClick) {
      console.log('Image clicked:', image);
      console.log('Prompt:', prompt);
      onImageClick(image, prompt);
    }
  };

  const handleButtonClick = (event) => {
    const image = JSON.parse(event.currentTarget.dataset.image);
    const prompt = event.currentTarget.dataset.prompt;
    console.log('Button clicked - Image:', image);
    console.log('Button clicked - Prompt:', prompt);
    if (onImageClick) {
      onImageClick(image, prompt);
    }
  };

  const handlePrev = () => {
    nav1.slickPrev();
  };

  const handleNext = () => {
    nav1.slickNext();
  };

  return (
    <div className={styles.carouselContainer}>
      {showThumbnails && (
        <Slider
          {...settingsThumbs}
          asNavFor={nav1}
          ref={(slider) => setNav2(slider)}
          className={styles.carouselThumbnails}
        >
          {images.map((image, index) => (
            <div key={index} className={styles.thumbnailSlide}>
              <img 
                src={image.url} 
                alt={`Thumbnail ${index + 1}`} 
                className={styles.thumbnailImage} 
                onClick={(event) => handleImageClick(event, index)}
              />
            </div>
          ))}
        </Slider>
      )}
      <Slider
        {...settingsMain}
        asNavFor={nav2}
        ref={(slider) => setNav1(slider)}
        className={styles.carouselSlider}
      >
        {images.map((image, index) => (
          <div key={index} className={styles.carouselSlide}>
            <img 
              src={image.url} 
              alt={`Slide ${index + 1}`} 
              style={{ width, height }} 
              data-prompt={image.opening_prompt_1}
              className={`${styles.carouselImage} ${currentSlide === index ? styles.zoom : ''}`} 
              onClick={(event) => handleImageClick(event, index)}
            />
            <div className={styles.buttonContainer}>
              {image.opening_question_1 && (
                <button
                  className={styles.overlayButton}
                  data-image={JSON.stringify(image)}
                  data-prompt={image.opening_prompt_1}
                  onClick={handleButtonClick}
                >
                  {image.opening_question_1}
                </button>
              )}
              {image.opening_question_2 && (
                <button
                  className={styles.overlayButton}
                  data-image={JSON.stringify(image)}
                  data-prompt={image.opening_prompt_2}
                  onClick={handleButtonClick}
                >
                  {image.opening_question_2}
                </button>
              )}
            </div>
          </div>
        ))}
      </Slider>
      <div className={styles.currentSlideIndicator}>
        {currentSlide + 1} / {images.length}
      </div>
      <div className={styles.customNavigation}>
        <button onClick={handlePrev} className={styles.carouselNavButton}>&larr;</button>
        <button onClick={handleNext} className={styles.carouselNavButton}>&rarr;</button>
      </div>
    </div>
  );
};

export default TempImageCarousel;
