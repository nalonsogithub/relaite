import React, { useEffect, useState, useContext } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from '../styles/SiteCarousel.module.css';
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../contexts/ChatContext';



const SiteCarousel = ({ carouselType, onImageClick, width, height, showThumbnails = false, showImageCount = false, onSlideChange  }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const { loadCarouselImages, imageURL, listingJson } = useContext(ListingAdminContext);
  const { 
	context_logUserInteraction
  } = useChat();

	  
	  

  // Transform listingJson.carousel into an array and map to the desired structure
  const images = Object.keys(listingJson.carousel)
      .map(key => ({
          url: `${imageURL}${listingJson.listing.master_listing_id.toLowerCase()}/${listingJson.carousel[key].image_file_name}`,
          image_click_user_prompt: listingJson.carousel[key].image_click_user_prompt,
          image_click_system_prompt: listingJson.carousel[key].image_click_system_prompt,
          image_tile_description: listingJson.carousel[key].image_tile_description,
          image_tile_destination: listingJson.carousel[key].image_tile_destination,
		  image_tile_instructions: listingJson.carousel[key].image_tile_instructions,
          image_order: listingJson.carousel[key].image_order // Temporary field for sorting
      }))
      .sort((a, b) => a.image_order - b.image_order) // Sort based on image_order
      .map(({ image_order, ...rest }) => rest); // Remove image_order after sorting

	
  // Show a loading state until the images are fetched
  if (images.length === 0) {
    return <div>Loading...</div>;
  }

  const settingsMain = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '0px',
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    beforeChange: (current, next) => {
      setCurrentSlide(next);
      onSlideChange(images[next].image_tile_instructions);
      // Add any description updates or conversation triggers here
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
    const prompt = image.image_click_user_prompt;
    const question = image.image_click_system_prompt;
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

  return (
    <div className={styles.carouselContainer}>
	  
	  
      {/* Thumbnails carousel */}
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

      {/* Main carousel */}
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
              data-prompt={image.image_click_user_prompt}
              data-question={image.image_click_system_prompt}
              className={`${styles.carouselImage} ${currentSlide === index ? styles.zoom : ''}`} 
              onClick={(event) => handleImageClick(event, index)}
            />
            <div className={styles.buttonContainer}>
              {image.image_click_user_prompt && (
                <button
                  className={styles.overlayButton}
                  data-image={JSON.stringify(image)}
                  data-prompt={image.image_click_user_prompt}
                  data-question={image.image_click_system_prompt}
                  onClick={handleButtonClick}
                >
                  {image.image_tile_description}
                </button>
              )}
            </div>
          </div>
        ))}
      </Slider>

      {/* Show image count */}
      {showImageCount && (
        <div className={styles.currentSlideIndicator}>
          {currentSlide + 1} / {images.length}
        </div>
      )}

      <div className={styles.customNavigation}>
        <button onClick={() => nav1.slickPrev()} className={styles.carouselNavButton}>&larr;</button>
        <button onClick={() => nav1.slickNext()} className={styles.carouselNavButton}>&rarr;</button>
      </div>
    </div>
  );
};

export default SiteCarousel;
