import React, { useEffect } from 'react';
import Slider from 'react-slick';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useImages } from '../../contexts/CarouselImageContext';
import styles from '../../styles/Carousel_styles/carousel.module.css';

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  flex: 0 1 auto;
  text-align: center;
  padding: 20px;
`;

const FooterContainer = styled.div`
  flex: 0 1 auto;
  padding: 20px;
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  img {
    width: 50px;
    height: 40px;
    margin: 0 5px;
    opacity: 1;
    transition: opacity 0.3s ease;
    &:hover {
      cursor: pointer;
    }
    &.inactive {
      opacity: 0.3;
    }
  }
`;

const CarouselWrapper = styled.div`
  margin: 0 auto;
  width: 100%;

  .slick-slide {
    position: relative;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      max-width: 100%;
      max-height: 400px;
      height: auto;
      width: auto;
    }
  }
  @media (max-width: 480px) {
    .slick-slide img {
      max-height: 200px;
    }
  }
  .slick-prev, .slick-next {
    z-index: 1;
    background: #ccc;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:before {
      opacity: 0.75;
      color: #000;
      font-size: 20px;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px; /* Set your desired max-width here */
  max-height: 400px; /* Set your desired max-height here */
  overflow: hidden; /* Hide overflow content */
  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensure the image covers the container */
  }
`;

const OverlayButton = styled.button`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  z-index: 2;
  &:hover {
    background: rgba(255, 255, 255, 1);
  }
`;

const Carousel = () => {
  const { images, toggleImageActive, loadImageData, checkAndUpdateSummaryImageStatus } = useImages();
  const navigate = useNavigate();
  const { setQuestion, setAssistant } = useChat();
  const { carouselType, setCarouselType } = useChat();	

  useEffect(() => {
	console.log('carouselType', carouselType)
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
	console.log('CHECK TYPE', image)
    if (!image.id) {
      console.error("Invalid image data", image);
      return;
    }
    console.log(`Image ${image.id} clicked, current active state is ${image.active}`);
    
	  console.log('image.url', image.url)
    if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/SummarizeConvo.gif') {
      setQuestion(image.opening_question);
      setAssistant(image.conversation_code);
      navigate('/summary'); // Navigate to the summary view
    } else if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/ReturnHome.gif') {
      navigate('/welcome'); // Navigate to the welcome page
    } else if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/MortgageCalculator_2.webp') {
      navigate('/mortgage_calculator'); // Navigate to the welcome page
	
    } else {
      setQuestion(image.opening_prompt);
		
	  if (image.url === 'https://hbbreact.blob.core.windows.net/hbbblob2/Loan_Approval.webp') {
		setAssistant('loan-approval')
		setQuestion('Can you help me get pre-approved for a loan?')
        navigate('/aigent'); // Navigate to the welcome page
      }
	  const destination = image.conversation_destination || 'main';
	  console.log('image.opening_question', image.opening_question)
	  console.log('image.conversation_code', image.conversation_code)
	  console.log('image.destination', destination)
	  setCarouselType(destination);

		
		
	  if (destination === "main") {
		  navigate('/aigent');		  
	  } else {
		  navigate('/carousel_aigent');
	  }
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
    <MainContainer>
      <Header>
        <h2>Home Buyer's Boutique</h2>
      </Header>
      <ThumbnailsContainer>
        {images.map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt={`Thumbnail ${index}`}
            className={!image.active ? 'inactive' : ''}
            onClick={() => handleImageClick(image)}
          />
        ))}
      </ThumbnailsContainer>
      <CarouselWrapper>
        <Slider {...settings}>
          {images.map((image) => (
            <ImageContainer key={image.id}>
              <img
                src={image.url}
                alt={`Slide ${image.title}`}
                className={!image.active ? 'inactive' : ''}
                onClick={() => handleImageClick(image)}
              />
              <OverlayButton onClick={() => handleImageClick(image)}>
                {image.conversation_description}
              </OverlayButton>
            </ImageContainer>
          ))}
        </Slider>
      </CarouselWrapper>
      <FooterContainer />
    </MainContainer>
  );
};

const SampleArrow = ({ type, onClick }) => (
  <button className={`slick-${type}`} onClick={onClick} style={{ display: 'block', background: 'grey' }}>
    {type === 'next' ? '>' : '<'}
  </button>
);

export default Carousel;
