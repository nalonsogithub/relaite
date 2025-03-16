import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from '../styles/ImageCarousel.module.css';
import { useImages } from '../contexts/CarouselImageContext';
import { useChat } from '../contexts/ChatContext'; // Import useChat hook

const ImageCarousel = ({ width, height, showThumbnails, showImageCount, onImageClick, carouselType }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const { images, isLoading, isError, loadImageData, imagesLoaded, setImagesLoaded } = useImages(carouselType);
  const { setConversationDescriptionList } = useChat(); // Destructure setConversationDescriptionList from useChat
  
  useEffect(() => {
    console.log('IN IMAGE CAROUSEL carouselType', carouselType);
    if (carouselType) {
      loadImageData(carouselType).then(() => {
        console.log('Success', carouselType);
      }).catch(error => {
        console.error('Error loading images:', error);
      });
    } else {
      console.log('IMAGE CAROUSEL carouselType', carouselType);
    }
  }, [carouselType, setImagesLoaded]);
  
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading images</div>;
  }

  if (!images || images.length === 0) {
    return <div>No images available</div>;
  }

  if (!Array.isArray(images)) {
    console.error('images is not an array', images);
    return <div>Images data is invalid</div>;
  } 

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
    const question = image.opening_question_1;
    if (onImageClick) {
      onImageClick(image, prompt, question);
    }
  };

  const handleButtonClick = (event) => {
    const image = JSON.parse(event.currentTarget.dataset.image);
    const prompt = event.currentTarget.dataset.prompt;
    const question = event.currentTarget.dataset.question;
    if (onImageClick) {
      onImageClick(image, prompt, question);
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
              data-question={image.opening_question_1}
              className={`${styles.carouselImage} ${currentSlide === index ? styles.zoom : ''}`} 
              onClick={(event) => handleImageClick(event, index)}
            />
            <div className={styles.buttonContainer}>
              {image.opening_question_1 && (
                <button
                  className={styles.overlayButton}
                  data-image={JSON.stringify(image)}
                  data-prompt={image.opening_prompt_1}
                  data-question={image.opening_question_1}
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
                  data-question={image.opening_question_2}
                  onClick={handleButtonClick}
                >
                  {image.opening_question_2}
                </button>
              )}
            </div>
          </div>
        ))}
      </Slider>
      {showImageCount && (
        <div className={styles.currentSlideIndicator}>
          {currentSlide + 1} / {images.length}
        </div>
      )}
      <div className={styles.customNavigation}>
        <button onClick={handlePrev} className={styles.carouselNavButton}>&larr;</button>
        <button onClick={handleNext} className={styles.carouselNavButton}>&rarr;</button>
      </div>
    </div>
  );
};

export default ImageCarousel;
