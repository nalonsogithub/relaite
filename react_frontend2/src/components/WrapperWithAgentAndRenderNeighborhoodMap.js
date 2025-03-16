import React, { useState, useEffect, useContext } from 'react';
import Aigent_2 from './Aigent_2';
import RenderNeighborhoodMap from './RenderNeighborhoodMap';
import styles from '../styles/WrapperWithAgentAndRenderNeighborhoodMap.module.css';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import { ListingDetailsContext } from '../contexts/ListingDetailsContext'; 
import CorporateBanner from './CorporateBanner';


const WrapperWithAgentAndNeighborhoodMap = () => {
  const [showCarousel, setShowCarousel] = useState(true);

  const carouselType = "default";  // Default value for carouselType
  const setCarouselType = () => {};  // Default to a no-op function
  const isLoading = false;  // Default value for isLoading (not loading)

  const loadImageData = () => {};  // Default to a no-op function

  const setQuestion = () => {};  // Default to a no-op function 
  const setPrompt = () => {};  // Default to a no-op function
  const assistant = "Default Assistant";  // Default value for assistant
  const setAssistant = () => {};  // Default to a no-op function
	
  const { listingDetails, loading, error } = useContext(ListingDetailsContext);
	
	

  const navigate = useNavigate();
//	const navigate = 'Hello'

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
    if (imageData.conversation_code.toLowerCase() === 'back') {
      setAssistant('main');
      setPrompt(prompt);
      setQuestion(question);
      navigate('/WrapperMainSiteCarousel');
	} else if (prompt) {
	  setAssistant('double_aigent');
      setPrompt(prompt);
      setQuestion(question);
    } else {
//      console.log('No prompt provided');
    }
  };
	
  const goToCarousel = () => {
    navigate('/WrapperMainSiteCarousel');
  };	
	
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }	

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerContainer}>
	  	<div className={styles.headerComponentContainer}>
		    		<CorporateBanner
						title = "Open House AIgent"
						url=""
						marqueeText="Neighborhood Details!"
        				leftBoxImage="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/carousel.png"
        				leftBoxDestination="/WrapperMainSiteCarousel" //			
					/>		  
	  	</div>
	  </div>

      {showCarousel && (
        <div className={styles.NeighborhoodMapContainer}>
          <RenderNeighborhoodMap address={listingDetails[0]?.listing_address} />
        </div>
      )}

      {/* Use different class depending on showCarousel state */}
      <div
        className={
          showCarousel ? styles.chatbotContainer : styles.chatbotContainer90
        }
      >
        <Aigent_2 
			collapseCarousel={collapseCarousel} 
			maxHeight="400px"
			chat_type="town"
		/>
      </div>
    </div>
  );
};

export default WrapperWithAgentAndNeighborhoodMap;
