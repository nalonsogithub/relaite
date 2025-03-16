import React, { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import Aigent_with_BinImageQGame from './Aigent_with_BinImageQGame';
import RenderBinImageQGame from './RenderBinImageQGame';
import styles from '../styles/WrapperWithAgentSummary.module.css';

const WrapperWithAgentSummary = () => {

  const carouselType = "default";  // Default value for carouselType
  const setCarouselType = () => {};  // Default to a no-op function
  const isLoading = false;  // Default value for isLoading (not loading)

  const loadImageData = () => {};  // Default to a no-op function

  const setQuestion = () => {};  // Default to a no-op function
  const setPrompt = () => {};  // Default to a no-op function
  const assistant = "Default Assistant";  // Default value for assistant
  const setAssistant = () => {};  // Default to a no-op function
	

  const navigate = useNavigate();
	
  const goToCarousel = () => {
    navigate('/WrapperMainSiteCarousel');
  };	

  const baseUrl = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return 'http://localhost:5000/api';
    } else if (hostname === 'www.aigentTechnologies.com') {
      return 'https://www.aigentTechnologies.com/api';
    } else if (hostname === 'www.openhouseaigent.com') {
      return 'https://www.openhouseaigent.com/api';
    } else {
      return 'https://hbb-zzz.azurewebsites.net/api'; // Default URL if no match
    }
  })();
	
  const handleSaveSummaryAsPDF = () => {
    fetch(`${baseUrl}/save_summary_as_pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Add any required data here
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response from the Flask API
//        console.log('PDF saved successfully', data);
      })
      .catch(error => {
        console.error('Error saving PDF:', error);
      });
  };
	
	
  return (
    <div className={styles.wrapper}>
      <div className={styles.headerContainer}>
	  	<div className={styles.headerComponentContainer}>
		  <div className={styles.header_left_container}>
			<button className={styles.returnButton} onClick={goToCarousel}>
			  ←
		    </button>
		  </div>
		  <div className={styles.header}>
		    <h1 className={styles.heading}>Conversation Summary</h1>
		  </div>

	  	</div>
	  </div>

      {/* Save as PDF button centered above the chat log */}
      <div className={styles.saveButtonContainer}>
        <button className={styles.saveButton} onClick={handleSaveSummaryAsPDF}>
          Save Summary as PDF
        </button>
      </div>
	  
	  
      <div className={styles.chatbotOuterContainer}>

        <div className={styles.ChatBotContainer}>
			<Aigent_with_BinImageQGame
			  showFull={false}
			  isModal={false}
			  showLabels={false}
			/>	  
	  	</div>
	  	
      </div>
    </div>
  );
};

export default WrapperWithAgentSummary;
