import React, { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import Aigent_2 from './Aigent_2';
import RenderBinImageQGame from './RenderBinImageQGame';
import styles from '../styles/WrapperWithCarouselAndBinImageQGame.module.css';
import CorporateBanner from './CorporateBanner';

import axios from 'axios';

const WrapperWithCarouselAndBinImageQGame = () => {
  const [imageDescription, setImageDescription] = useState('');
  const [showCarousel, setShowCarousel] = useState(true);
//  const [questions, setQuestions] = useState([]);  
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null); // Error state
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
    context_siteLocation, 
    context_setSiteLocation, 
    context_ConvoTop, 
    context_setConvoTop, 
    context_questionId, 
    context_setQuestionId, 
    context_showUser, 
    context_setShowUser,  
    context_showAgent, 
    context_setShowAgent, 
    context_context, 
    context_setContext,
    context_ContextQuestionOrigin, 
	context_setContextQuestionOrigin,
    context_listing_id,         
    context_set_listing_id,     
	context_logUserInteraction		  
  } = useChat();	
  const [marqueeText, setMarqueeText] = useState("Home Details"); // Initial marquee text
	
  // Clipboard handler
  const handleClipboardClick = () => {
	console.log("COPY CLIKCED");
    setMarqueeText("Chat copied to clipboard!"); // Update marquee text
    setTimeout(() => setMarqueeText(""), 5000); // Clear marquee text after 5 seconds    // Optional: Add any other logic, such as logging the event or showing a toast
    context_logUserInteraction("Clipboard", "Copied to clipboard", "chat");
  };
	
  const toggleCarousel = () => {
    setShowCarousel(!showCarousel);
  };

  const collapseCarousel = () => {
    setShowCarousel(false);
  };

  const handleImageClick = (imageData, prompt = null, question = null) => {
    if (imageData.conversation_code.toLowerCase() === 'back') {
      navigate('/WrapperMainSiteCarousel');
    }
  };
	
  const handleAnswersSelected = (question, answer) => {
	  		const action = 'Bin Q Game Answer';
			const actionSource = 'system';
			const questionSource = 'binimageqgame';
    		context_logUserInteraction(question, answer, questionSource, action, actionSource);
	  
    // Call context_logUserInteraction to log the user interaction
//    context_logUserInteraction(question, answer, 'binimageqgame');	  
  };	
	
  // Function to receive image description from the child component
  const handleImageDescription = (description) => {
	context_setContext(description);
    setImageDescription(description);
  };
	
  const goToCarousel = () => {
    navigate('/WrapperMainSiteCarousel');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerContainer}>
        <div className={styles.headerComponentContainer}>
          <div className={styles.header}>
		    		<CorporateBanner
						title = "Open House AIgent"
						url=""
						marqueeText={marqueeText}
						leftBoxImage="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/carousel.png"
        				leftBoxDestination="/WrapperMainSiteCarousel" 	  
					/>
	  
          </div>

        </div>
      </div>

      {/* Handle loading and error states */}
      {isLoading ? (
        <div>Loading questions...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          {showCarousel && (
            <div className={styles.binQGameContainer}>
              <RenderBinImageQGame onImageChange={handleImageDescription} onAnswersSelected={handleAnswersSelected} /> 
            </div>
          )}

          <div className={showCarousel ? styles.chatbotContainer : styles.chatbotContainer90}>
            <Aigent_2 
				maxHeight="100%" 
				chat_type="home"
				onCopyToClipboard={handleClipboardClick}
			/>
          </div>
        </>
      )}
    </div>
  );
};

export default WrapperWithCarouselAndBinImageQGame;
