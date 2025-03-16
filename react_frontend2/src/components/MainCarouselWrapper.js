import React, { useEffect, useState } from 'react';
import ImageCarousel from './imageCarousel';
import styles from '../styles/maincarouselwrapper.module.css';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useImages } from '../contexts/CarouselImageContext';
//import LCClient from './LCClient';

const MainCarouselWrapper = () => {
  const [showCarousel, setShowCarousel] = useState(true);
  const navigate = useNavigate();
  const { loadImageData, toggleImageActive } = useImages();
  const [carouselDimensions, setCarouselDimensions] = useState({ width: '50vw', height: '50vh' });
  const [flattenedDescriptions, setFlattenedDescriptions] = useState([]);
	
  const { carouselType, setCarouselType, conversationDescriptionList, isLoading } = useChat(); // Add conversationDescriptions
  const { setChatId, setQuestion, setAssistant, setPrompt } = useChat();
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
    context_showUser, 
    context_setShowUser, 
    context_showAgent, 
    context_setShowAgent, 
    context_context, 
    context_setContext,
    context_listing_id,        
    context_set_listing_id     
  } = useChat();	
	
	
  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 600) {
		console.log('BELOW 600')
        setCarouselDimensions({ width: '90vw', height: '90vh' });
      } else if (window.innerWidth < 1200) {
		console.log('BELOW 1200')
        setCarouselDimensions({ width: '70vw', height: '70vh' });
      } else {
		console.log('NOT BELOW')
        setCarouselDimensions({ width: '50vw', height: '50vh' });
      }
		
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
	
  useEffect(() => {
    if (carouselType !== 'main') {
      setCarouselType('main'); 
    }
  }, [carouselType, setCarouselType]);

  useEffect(() => {
    
    let parsedDescriptions = [];
    if (Array.isArray(conversationDescriptionList) && conversationDescriptionList.length > 0) {
      if (typeof conversationDescriptionList[0] === 'string') {
        const firstElement = conversationDescriptionList[0].trim();
        if (firstElement.startsWith('[') || firstElement.startsWith('{')) {
          try {
            const parsedArray = JSON.parse(conversationDescriptionList[0]);
            if (Array.isArray(parsedArray)) {
              parsedDescriptions = parsedArray;
            } else {
              parsedDescriptions = conversationDescriptionList;
            }
          } catch (error) {
            console.error('Error parsing description string:', error);
            parsedDescriptions = conversationDescriptionList;
          }
        } else {
          parsedDescriptions = conversationDescriptionList;
        }
      } else if (Array.isArray(conversationDescriptionList[0])) {
        parsedDescriptions = conversationDescriptionList[0];
      } else {
        parsedDescriptions = conversationDescriptionList;
      }
    }
    
    setFlattenedDescriptions(parsedDescriptions);
  }, [conversationDescriptionList]);	
	
	
  const handleImageClick = (image, prompt = null, question = null) => {
	console.log('CLICK', image.conversation_code.toLowerCase());
    if (!image.id) {
      console.error("Invalid image data", image);
      return;
    }
    if (image.conversation_code.toLowerCase() === 'summary') {
      setAssistant(image.conversation_code);
      setQuestion(question);
	  setPrompt(prompt);
	  console.log('SUMMARY PROMPT', prompt);
      navigate('/SummaryView');
    } else if (image.conversation_code.toLowerCase() === 'back') {
      setAssistant(image.conversation_code);
      navigate('/WelcomePage');
    } else if (image.conversation_code.toLowerCase() === 'mortgage') {
      setAssistant(image.conversation_code);
      navigate('/MortgageCalculator');
    } else if (image.conversation_code.toLowerCase() === 'loan') {
        setAssistant(image.conversation_code);
        setQuestion(question);
  	    setPrompt(prompt);
        navigate('/aigent');
		setChatId('LOANDETAILS');
    } else {
      const destination = image.conversation_destination || 'main';
      setCarouselType(destination);
      if (destination === "main") {
        setAssistant(image.conversation_code);
 	    setPrompt(prompt);
        setQuestion(question);
        navigate('/WrapperWithContactAndBot');
		setChatId('agent');
      } else {
  	    setPrompt(prompt);
        setQuestion(question);
        setAssistant(image.conversation_code);
        navigate('/WrapperWithCarouselAndBinImageQGame');
		setChatId('HOMEDETAILS');
		  
      }
//      toggleImageActive(image.id);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
  	    <div className={styles.logoContainerNoPadding}>
		  <img
		    src="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/banner_blue_400x100.png"
		    alt="Open House AIgent. A product from REAL ESTaiTE"
		    className={styles.logoImageNoPadding}
		  />
	    </div>	  
	  
      </div>
      <div className={styles.carousel}>
        <ImageCarousel 
          width={carouselDimensions.width} 
          height={carouselDimensions.height} 
          showThumbnails={true} 
          onImageClick={handleImageClick}
   	      carouselType={carouselType}
        />
	  </div>
      <div className={styles.footer}>
        <h2>Instructions:</h2>
        <ul>
          {Array.isArray(flattenedDescriptions) && flattenedDescriptions.length > 0 ? (
            flattenedDescriptions.map((description, index) => (
              <li key={index}>{description}</li>
            ))
          ) : (
            <li>No descriptions available</li>
          )}
        </ul>
	  </div>
    </div>
  );
};

export default MainCarouselWrapper;
