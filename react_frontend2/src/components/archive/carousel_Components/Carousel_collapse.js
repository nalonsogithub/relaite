import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useImages } from '../../contexts/CarouselImageContext';
import styles from '../../styles/carousel_styles/carousel_collapse.module.css';

const Carousel_collapse = () => {
  const { images, toggleImageActive, loadImageData, checkAndUpdateSummaryImageStatus } = useImages();
  const navigate = useNavigate();
  const { setQuestion, setAssistant } = useChat();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (images.length === 0) {
      loadImageData();
    } else {
      checkAndUpdateSummaryImageStatus();
    }
  }, [images.length, loadImageData, checkAndUpdateSummaryImageStatus]);

  useEffect(() => {
    console.log("Current state of images:", images.map(img => `ID: ${img.id}, URL: ${img.url}, Active: ${img.active}`));
  }, [images]);

  const handleImageClick = (image) => {
    if (!image.id) {
      console.error("Invalid image data", image);
      return;
    }
    console.log(`Image ${image.id} clicked, current active state is ${image.active}`);
    
    if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/SummarizeConvo.gif') {
      setQuestion(image.opening_question);
      setAssistant(image.conversation_code);
      navigate('/summary'); // Navigate to the summary view
    } else if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/ReturnHome.gif') {
      navigate('/welcome'); // Navigate to the welcome page
    } else {
      setQuestion(image.opening_question);
      setAssistant(image.conversation_code);
      navigate('/aigent');
      toggleImageActive(image.id);
      console.log('handleImageClick TOGGLING', images.map(img => `${img.url}: ${img.active ? 'Active' : 'Inactive'}`));
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    nextArrow: <SampleArrow type="next" />,
    prevArrow: <SampleArrow type="prev" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.carouselWrapper}>
        <Slider {...settings}>
          {images.map((image) => (
            <div key={image.id} className={styles.imageContainer}>
              <img
                src={image.url}
                alt={`Slide ${image.title}`}
                className={!image.active ? styles.inactive : ''}
                onClick={() => handleImageClick(image)}
                onLoad={() => console.log(`Loaded image: ${image.url}`)}
                onError={(e) => console.error(`Error loading image: ${image.url}`, e)}
              />
              <button className={styles.overlayButton} onClick={() => handleImageClick(image)}>
                {image.conversation_description}
              </button>
            </div>
          ))}
        </Slider>
      </div>
      <div className={styles.footerContainer}></div>
    </div>
  );
};

const SampleArrow = ({ type, onClick }) => (
  <button className={`slick-${type}`} onClick={onClick} style={{ display: 'block', background: 'grey' }}>
    {type === 'next' ? '>' : '<'}
  </button>
);

export default Carousel_collapse;
