import React, { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import Aigent_2 from './Aigent_2';
import Contact from './Contact';
import styles from '../styles/WrapperWithContactAndBot.module.css';
import CorporateBanner from './CorporateBanner';

const WrapperWithContactAndBot = () => {
  const [showCarousel, setShowCarousel] = useState(true);


const carouselType = "default";  // Default value for carouselType
const setCarouselType = () => {};  // Default to a no-op function
const isLoading = false;  // Default value for isLoading (not loading)

const loadImageData = () => {};  // Default to a no-op function

const setQuestion = () => {};  // Default to a no-op function
const setPrompt = () => {};  // Default to a no-op function
const assistant = "Default Assistant";  // Default value for assistant
const setAssistant = () => {};  // Default to a no-op function
	

  const navigate = useNavigate();

  useEffect(() => {
    if (carouselType !== 'agent') {
      setCarouselType('main'); 
	  setAssistant('agent');
    }
  }, [carouselType, setCarouselType, assistant, setAssistant]);
  
  const toggleCarousel = () => {
    setShowCarousel(!showCarousel);
  };

  const collapseCarousel = () => {
    setShowCarousel(false);
  };
  

	
  const goToCarousel = () => {
    navigate('/WrapperMainSiteCarousel');
  };	

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerContainer}>
	  	<div className={styles.headerComponentContainer}>
		    		<CorporateBanner
						title = "Open House AIgent"
						url=""
						marqueeText="Agent Details!"
        				leftBoxImage="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/carousel.png"
        				leftBoxDestination="/WrapperMainSiteCarousel" //			
					/>	  
	  	</div>
	  </div>

      <div
        className={styles.chatbotContainer}
      >
        <Aigent_2 
	  		collapseCarousel={collapseCarousel}
	    	showFull = {true}
	  		maxHeight = "500px"
	  		chat_type = "agent"
	    />
      </div>
	  
	  
	  
      {showCarousel && (
        <div className={styles.contactContainer}>
          <Contact />
        </div>
      )}

    </div>
  );
};

export default WrapperWithContactAndBot;
