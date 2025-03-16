import React, { useState } from 'react';
import ImageBubbleGame from './ImageBubbleGame';
//import RenderBinImageQGame from './RenderBinImageQGame';
import styles from '../styles/RenderImageBubbleGame.module.css';

const RenderImageBubbleGame = () => {
	
  const [showIntro, setShowIntro] = useState(true);
//  const [navigateToBinGame, setNavigateToBinGame] = useState(false);	
  
  // Sample data for the ImageBubbleGame
  const listing_url = 'https://hbbreact.blob.core.windows.net/hbbblob2/2b78c611-af06-4449-a5b6-fb2d433faf8b/';
	
  const backgroundImages = [
	`${listing_url}19-Woekel--Home-Front.gif`,
	`${listing_url}Welcome-to-Methuen.gif`,
	`${listing_url}Patrick-Brusil-Headshot.gif`,
  ];
  
  const introImage = `${listing_url}19-Woekel--Home-Front.gif`;	
	
  const listOfWords = [
    ['Good Price', 'Cramped', 'Hidden Gem', 'Just Okay', 'TLC', 'Great Home'],
    ['Easy Commute', 'Friendly', 'Crowded', 'Far', 'Quiet', 'Noisy'],
    ['Open and Honest', 'Direct', 'Distant', 'Honest', 'Energy', 'Smart'],
  ];
  

  const listOfSelectionFrequency = [
    [1, 4, 6, 8, 2, 1],
    [9, 1, 8, 5, 3, 1],
    [9, 7, 2, 4, 2, 10],
  ];
  
  const answersExpected = [3, 3, 3];
  const thankYouMessages = [
	"Thank you for your first impression on the pad! Now we have some questions about the neighborhood if you still have time.",
	"Thank you for your first impression on the neighborhood! We have some additional questions about the agent if you still have time.",
	"Thank you for taking the time to answer our questions."
  ];
  const prompts = [
	"What were your first impressions of the house?", 
	"What were your first impressions of the neighborhood?",
	"What were your impressions of Patrick?"
  ];
  const instructions = [
	"Click on the impressions to see how others responded.", 
	"Click on the impressions to see how others responded.",
	"Click on the impressions to see how others responded."
  ];
  
  const handleAnswersSelected = (question, answers) => {
//    console.log(`Question: ${question}`);
//    console.log(`Selected Answers: ${answers.join(', ')}`);
  };
	
//  const navigateToBinImageQGame = () => {
//    setNavigateToBinGame(true);
//  };
//
//  if (navigateToBinGame) {
//    return <RenderBinImageQGame />;
//  }	
	
  const handleIntroClick = () => {
    setShowIntro(false);
  };

  return (
    <div className={styles.bg_mainContainer}>
      {/* Container Above the Game */}
      <div className={styles.bg_textContainer}>
        <h2>Welcome to the Real Estate Experience</h2>
        <p>Explore the property and share your thoughts with us. Your feedback is valuable!</p>
      </div>
      
      {/* The Game Container */}
      <div className={styles.bg_gameWrapper}>
        <div className={styles.bg_floatingContainer}>
          <ImageBubbleGame 
	        introImage={introImage}
            backgroundImages={backgroundImages}
            listOfWords={listOfWords}
            listOfSelectionFrequency={listOfSelectionFrequency}
            gameHeight="100%"
            gameWidth="100%"
            answersExpected={answersExpected}
            thankYouMessage={thankYouMessages}
            prompt={prompts}
	        instructions={instructions}
	        onAnswersSelected={handleAnswersSelected} // Pass the callback function
          />
        </div>
      </div>
      
      {/* Container Below the Game */}
      <div className={styles.bg_textContainer}>
        <p>Thank you for participating! Your insights help us improve our services.</p>
      </div>
    </div>  
  );
};

export default RenderImageBubbleGame;
