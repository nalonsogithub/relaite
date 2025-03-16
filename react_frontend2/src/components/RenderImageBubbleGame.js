import React, { useState } from 'react';
import ImageBubbleGame from './ImageBubbleGame';
//import RenderBinImageQGame from './RenderBinImageQGame';
import styles from '../styles/RenderImageBubbleGame.module.css';
import { useChat } from '../contexts/ChatContext';


const RenderImageBubbleGame = ({onImageBubbleGameAnswersSelected}) => {
	
  const [showIntro, setShowIntro] = useState(true);
  const { 
	context_logUserInteraction
  } = useChat();
	
const handleAnswersSelected = (question, answers) => {
  onImageBubbleGameAnswersSelected(question, answers); // Pass the received question and answers
//  console.log(`RENDER Question: ${question}`);
//  console.log(`RENDER Selected Answers: ${answers}`);
};
	
	
  const handleIntroClick = () => {
	context_logUserInteraction('All first impressions answered', null, 'ImageBubbleGame', 'All first impressions answered', null);
    setShowIntro(false);
  };

  return (
    <div className={styles.bg_mainContainer}>
      {/* Container Above the Game */}
		<div className={styles.bgTextContainer}>
		  <h2 className={styles.bgHeading}>Welcome to the Real Estate Experience</h2>
		  <p className={styles.bgParagraph}>Explore the property and click on your first impressions to see how others reacted. Your feedback is valuable!</p>
		</div>      
      {/* The Game Container */}
      <div className={styles.bg_gameWrapper}>
        <div className={styles.bg_floatingContainer}>
          <ImageBubbleGame 
            gameHeight="100%"
            gameWidth="100%"
	        onImageBubbleGameAnswersSelected={handleAnswersSelected} // Pass the callback function
          />
        </div>
      </div>
      
      {/* Container Below the Game */}
    </div>  
  );
};

export default RenderImageBubbleGame;
