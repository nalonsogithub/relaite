import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import SiteCarousel from './SiteCarousel'; // Assuming this is updated to fetch from the correct context
import styles from '../styles/WrapperMainSiteCarousel.module.css';
import ReactMarkdown from 'react-markdown';
import CorporateBanner from './CorporateBanner';


const WrapperMainSiteCarousel = () => {
  const [showCarousel, setShowCarousel] = useState(true);
  const [carouselDimensions, setCarouselDimensions] = useState({ width: '50vw', height: '50vh' });
  const [instructions, setInstructions] = useState(''); // State to hold current image instructions
  const navigate = useNavigate();

  const { 
    context_chatLog, 
    context_addMessageToChatLog, 
    context_systemPrompt, 
    context_setSystemPrompt, 
    context_userPrompt, 
    context_setUserPrompt, 
    context_chatId, 
    context_setChatId, 
    context_questionId, 
    context_setQuestionId, 
    context_siteLocation, 
    context_setSiteLocation, 
    context_ConvoTop,
    context_setConvoTop,
    context_showUser, 
    context_setShowUser, 
    context_showAgent, 
    context_setShowAgent, 
    context_context, 
    context_setContext,
    context_listing_id,        
    context_set_listing_id,
	context_homeChatHist, 
	context_agentChatHist, 
	context_townChatHist,
	context_logUserInteraction,
	  
  } = useChat();	
	
	
  // Handle window resizing to update carousel dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 600) {
        setCarouselDimensions({ width: '90vw', height: '90vh' });
      } else if (window.innerWidth < 1200) {
        setCarouselDimensions({ width: '70vw', height: '70vh' });
      } else {
        setCarouselDimensions({ width: '50vw', height: '50vh' });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Function to handle image click and navigate or set instructions
  const handleImageClick = (image, prompt = null, question = null) => {
	context_setSiteLocation(image.site_location);
	context_setConvoTop("");
	context_setShowUser('false');
	context_setShowAgent('false');

	  
	context_setSystemPrompt(image.image_click_system_prompt);
	context_setUserPrompt(image.image_click_user_prompt);

	// Define a map for destinations and corresponding chat histories
	const chatHistories = {
	  home: context_homeChatHist,
	  neighborhood: context_townChatHist,
	  agent: context_agentChatHist,
	};

	// Get the chat history based on the destination
	const destination = image.image_tile_destination.toLowerCase();
	const chatHistory = chatHistories[destination];
	console.log('DESTINATION', image.image_tile_destination.toLowerCase(), 'ch', chatHistory)

  
	if (Array.isArray(chatHistory) && chatHistory.some((message) => message.user === "AIgent")) {
	  context_setSystemPrompt('');
	  context_setUserPrompt('');
	}

	  
//	const question = null;
	const action = image.image_tile_destination.toLowerCase();
	const actionSource = 'carousel';
	const questionSource = null;
	const answer = null;
	context_logUserInteraction(image.image_click_system_prompt, answer, questionSource, action, actionSource);	  
	  
    // Handle navigation based on image conversation code
    if (image.image_tile_destination.toLowerCase() === 'summary') {
      navigate('/WrapperWithAgentSummary2');
    } else if (image.image_tile_destination.toLowerCase() === 'welcome') {
      navigate('/WelcomePage');
    } else if (image.image_tile_destination.toLowerCase() === 'mortgage') {
      navigate('/MortgageCalculator');
    } else if (image.image_tile_destination.toLowerCase() === 'home') {
      navigate('/WrapperWithCarouselAndBinImageQGame');
    } else if (image.image_tile_destination.toLowerCase() === 'neighborhood') {
      navigate('/WrapperWithAgentAndRenderNeighborhoodMap');
    } else if (image.image_tile_destination.toLowerCase() === 'agent') {
      navigate('/WrapperWithContactAndBot');
		
//      setChatId('LOANDETAILS');
    } else {
      navigate('/WelcomePage');
    }
  };

  // Function to update the instructions when the slide changes
  const updateInstructions = (newInstructions) => {
	console.log('HELLO');
    setInstructions(newInstructions || 'No instructions available for this image.');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
	  	<div className={styles.CorporateBannerContainer}>
		    		<CorporateBanner
						title = "Open House AIgent"
						url=""
						marqueeText="Welcome to the Open House AIgent!"
        				leftBoxImage="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/carousel.png"
        				leftBoxDestination="/dashboard" //			
					/>	  
		</div>
	  
{/*
        <div className={styles.logoContainerNoPadding}>
          <img
            src="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/banner_blue_400x100.png"
            alt="Open House AIgent. A product from REAL ESTaiTE"
            className={styles.logoImageNoPadding}
          />
        </div>
*/}		
      </div>
      <div className={styles.carousel}>
        <SiteCarousel
          width={carouselDimensions.width}
          height={carouselDimensions.height}
          showThumbnails={true}
          onImageClick={handleImageClick}
          onSlideChange={updateInstructions} // Pass function to update instructions on slide change
          carouselType={"main"}
        />
      </div>
      <div className={styles.footer}>
        <h2>Instructions:</h2>
        <div className={styles.instructionsContainer}>
          <ReactMarkdown>
            {instructions}
          </ReactMarkdown>
        </div>	  
      </div>
    </div>
  );
};

export default WrapperMainSiteCarousel;
