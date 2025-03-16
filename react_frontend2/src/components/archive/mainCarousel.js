import React, { useEffect } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useImages } from '../contexts/CarouselImageContext';
import styles from '../styles/maincarousel.module.css';

const MainCarousel = () => {
  const { images, toggleImageActive, loadImageData, checkAndUpdateSummaryImageStatus } = useImages();
  const navigate = useNavigate();
  const { setQuestion, setAssistant } = useChat();
  const { carouselType, setCarouselType } = useChat();	

  useEffect(() => {
    if (images.length === 0 || carouselType !== 'main') {
      loadImageData('main');
    } else {
      checkAndUpdateSummaryImageStatus();
    }
  }, [images.length, loadImageData, checkAndUpdateSummaryImageStatus]);

  useEffect(() => {
    console.log("Current state of images:", images.map(img => `ID: ${img.id}, Active: ${img.active}`), images);
  }, [images]);

  const handleImageClick = (image) => {
    if (!image.id) {
      console.error("Invalid image data", image);
      return;
    }
    if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/SummarizeConvo.gif') {
      setQuestion(image.opening_question);
      setAssistant(image.conversation_code);
      navigate('/summary');
    } else if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/ReturnHome.gif') {
      navigate('/welcome');
    } else if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/MortgageCalculator_2.webp') {
      navigate('/mortgage_calculator');
    } else {
      setQuestion(image.opening_prompt);
      if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/Loan_Approval.webp') {
        setAssistant('loan-approval');
        setQuestion('Can you help me get pre-approved for a loan?');
        navigate('/aigent');
      }
      const destination = image.conversation_destination || 'main';
      setCarouselType(destination);
      if (destination === "main") {
        navigate('/aigent');
      } else {
        navigate('/carousel_aigent');
      }
      toggleImageActive(image.id);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
	centerPadding: '50px',
    swipeToSlide: true,
    focusOnSelect: true,
    nextArrow: <SampleArrow type="next" />,
    prevArrow: <SampleArrow type="prev" />
//    responsive: [
//      {
//        breakpoint: 1024,
//        settings: {
//          slidesToShow: 1,
//          slidesToScroll: 1,
//          infinite: true,
//          dots: true
//        }
//      },
//      {
//        breakpoint: 600,
//        settings: {
//          slidesToShow: 1,
//          slidesToScroll: 1,
//          initialSlide: 1
//        }
//      },
//      {
//        breakpoint: 480,
//        settings: {
//          slidesToShow: 1,
//          slidesToScroll: 1
//        }
//      }
//    ]
  };

  return (
    <div className={styles.mainCarouselContainer}>
      <div className={styles.mainCarouselheader}>
        <h2>Home Buyer's Boutique</h2>
      </div>
      <div className={styles.mainCarouselthumbnailsContainer}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt={`Thumbnail ${index}`}
            className={!image.active ? styles.mainCarouselinactive : ''}
            onClick={() => handleImageClick(image)}
          />
        ))}
      </div>
      <div className={styles.mainCarouselcarouselWrapper}>
        <Slider {...settings}>
          {images.map((image) => (
            <div key={image.id} className={styles.mainCarouselimageContainer}>
              <img
                src={image.url}
                alt={`Slide ${image.title}`}
                className={!image.active ? styles.mainCarouselinactive : ''}
                onClick={() => handleImageClick(image)}
              />
              <button className={styles.mainCarouseloverlayButton} onClick={() => handleImageClick(image)}>
                {image.conversation_description}
              </button>
            </div>
          ))}
        </Slider>
      </div>
      <div className={styles.mainCarouselfooterContainer} />
    </div>
  );
};

const SampleArrow = ({ type, onClick }) => (
  <button className={`slick-${type}`} onClick={onClick} style={{ display: 'block', background: 'grey' }}>
    {type === 'next' ? '>' : '<'}
  </button>
);

export default MainCarousel;
