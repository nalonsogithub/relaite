import React, { useEffect, useState } from 'react';
import BinImageQGame from './BinImageQGame';
import styles from '../styles/RenderBinImageQGame.module.css';
import { useBinQGameImages } from '../contexts/BinQGameContext';

const RenderBinImageQGame = ({ listing_id }) => {
  const { loadGameData, dataLoaded } = useBinQGameImages();
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null); // Add error handling
  const [reloadData, setReloadData] = useState(true);	

  // Fetch images and questions when the component mounts
//  useEffect(() => {
//    if (reloadData) { 	  
//		console.log('CHECK RELOAD', reloadData);
//		const fetchData = async () => {
//		  try {
//			const fetchedData = await loadGameData(listing_id);
//
//			if (!fetchedData || fetchedData.length === 0) {
//			  throw new Error('No data available');
//			}
//
//			// Extract background images and questions from fetched data
//			const images = fetchedData.map(item => item.url || ''); // Ensure the URL exists
//			const questionGroups = fetchedData.map(item => item.questions?.map(q => q.question) || []); 
//
//			console.log('IMAGES', images);
//			setBackgroundImages(images);
//			setQuestions(questionGroups);
//			console.log('questionGroups', questionGroups);
//			setReloadData(false);
//		  } catch (error) {
//			console.error('Error fetching game data:', error);
//			setError('Failed to load game data');
//		  }
//		};
//
//		fetchData(); 
//	}
//  }, [listing_id, loadGameData]);

  const handleAnswersSelected = (selections) => {
    console.log('User Selections From Render:', selections);
  };

  if (error) {
    return <div className={styles.error}>Error: {error}</div>; // Show error message
  }

  if (!dataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.centerContainer}>
      <div className={styles.floatingContainer}>
        <BinImageQGame
          backgroundImages={backgroundImages}
          questions={questions}
          overallRating={6}
          answersExpected={questions.map(group => group.length)}  // Number of questions for each image
          containerHeight='600px'  // Adjusted container height
          containerWidth='800px'   // Adjusted container width
          onAnswersSelected={handleAnswersSelected}
        />
      </div>
    </div>
  );
};

export default RenderBinImageQGame;
