import React, { useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from '../styles/TempImageCarousel.module.css';

const images = [
  'https://hbbreact.blob.core.windows.net/hbbblob2/e8616035-912e-455c-bcf9-d0a018886fbb/19-Woekel--Home-Front.gif',
  'https://hbbreact.blob.core.windows.net/hbbblob2/e8616035-912e-455c-bcf9-d0a018886fbb/Patrick-Brusil-Headshot.gif',
  'https://hbbreact.blob.core.windows.net/hbbblob2/e8616035-912e-455c-bcf9-d0a018886fbb/Welcome-to-Methuen.gif'
];

const TempImageCarousel = ({ width, height, showThumbnails, onImageClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);

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
    beforeChange: (current, next) => setCurrentSlide(next),
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

  const handleImageClick = (index) => {
    if (onImageClick) {
      onImageClick(index);
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
                src={image} 
                alt={`Thumbnail ${index + 1}`} 
                className={styles.thumbnailImage} 
                onClick={() => handleImageClick(index)}
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
              src={image} 
              alt={`Slide ${index + 1}`} 
              style={{ width, height }} 
              className={`${styles.carouselImage} ${currentSlide === index ? styles.zoom : ''}`} 
              onClick={() => handleImageClick(index)}
            />
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
