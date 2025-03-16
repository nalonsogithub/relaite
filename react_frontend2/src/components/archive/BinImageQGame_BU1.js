import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from '../styles/BinImageQGame.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { useSwipeable } from 'react-swipeable';
import { useBinQGameImages } from '../contexts/BinQGameContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BinImageQGame = ({ 
  onAnswersSelected = '',
  overallRating = 6,
  containerHeight = '600px',
  containerWidth = '800px',
}) => {
  const { loadGameData, dataLoaded, gameData } = useBinQGameImages();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userSelections, setUserSelections] = useState([]);
  const [showQuestions, setShowQuestions] = useState(true);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [showRatingComparison, setShowRatingComparison] = useState(false);

  // Load the data from the context when the component mounts
  useEffect(() => {
	console.log('inEFFECT', dataLoaded);
    if (!dataLoaded) {
      loadGameData('some_listing_id');
	  console.log('DATA', gameData);
    }
  }, [dataLoaded, loadGameData]);
//  }, []);
	
	
  // Log or operate on gameData only after it has been updated
  useEffect(() => {
	console.log('gameData?.length', gameData.length);
    if (gameData?.length > 0) {
      console.log('Game Data has been loaded:', gameData);
      // Initialize userSelections based on questions when gameData is loaded
      const initialSelections = Array(gameData.length).fill().map(() => Array(gameData[0].questions.length).fill(null));
      setUserSelections(initialSelections);
    }
  }, [gameData]);
		
		
  // Check if all questions are answered and send the answers to the parent component
  useEffect(() => {
    const areAllAnswered = userSelections.every(imageSelections => 
      imageSelections.every(selection => selection !== null)
    );
    setAllQuestionsAnswered(areAllAnswered);

    if (areAllAnswered) {
      const result = gameData.map((item, imageIndex) => {
        return item.questions.map((question, questionIndex) => ({
          question: question.question,
          answer: userSelections[imageIndex][questionIndex],
        }));
      });
      onAnswersSelected(result);
    }
  }, [userSelections, gameData, onAnswersSelected]);



  const handleAnswer = (questionIndex, answer) => {
    const newSelections = [...userSelections];
    newSelections[currentImageIndex][questionIndex] = answer;
    setUserSelections(newSelections);
  };

  const handleToggleQuestions = () => {
    setShowQuestions(!showQuestions);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % gameData.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + gameData.length) % gameData.length
    );
  };

  const calculateUserRating = () => {
    const totalQuestions = userSelections.flat().length;
    const thumbsUpCount = userSelections.flat().filter(selection => selection === 'up').length;
    const userRating = (thumbsUpCount / totalQuestions) * 10;
    setUserRating(userRating.toFixed(1));
  };

  const handleSeeRating = () => {
    if (allQuestionsAnswered) {
      if (!showRatingComparison) {
        calculateUserRating();
      }
      setShowRatingComparison(!showRatingComparison);
    }
  };

  // Ensure `useSwipeable` is called unconditionally at the top
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePreviousImage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // Wait for the gameData to be fully loaded before rendering
//  if (!dataLoaded || !gameData || gameData.length === 0) {
  if (gameData.length === 0) {
    return <div>Loading...</div>;  
  }	



  const currentImage = gameData[currentImageIndex]?.url || '';
  const currentQuestions = gameData[currentImageIndex]?.questions || [];

  // Data for the comparison chart
  const chartData = {
    labels: ['User Rating', 'Overall Rating'],
    datasets: [
      {
        label: 'Rating',
        data: [userRating, overallRating],
        backgroundColor: ['#007bff', '#28a745'],
      },
    ],
  };

  const options = {
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className={styles.container}>
      <div 
        {...swipeHandlers}
        className={styles.background}
        style={{ 
          backgroundImage: `url(${currentImage})`,
          height: containerHeight,
          width: containerWidth,
        }}
      >  
        {!showRatingComparison && showQuestions && (
          <div className={styles.grid}>
            {currentQuestions.map((question, index) => (
              <div key={index} className={styles.questionContainer}>
                <p className={styles.question}>{question.question}</p>
                <div>
                  <button 
                    className={`${styles.iconButton} ${userSelections[currentImageIndex][index] === 'up' ? styles.selected : ''}`}
                    onClick={() => handleAnswer(index, 'up')}
                  >
                    <FontAwesomeIcon icon={faThumbsUp} />
                  </button>
                  <button 
                    className={`${styles.iconButton} ${userSelections[currentImageIndex][index] === 'down' ? styles.selected : ''}`}
                    onClick={() => handleAnswer(index, 'down')}
                  >
                    <FontAwesomeIcon icon={faThumbsDown} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showRatingComparison && (
          <div className={styles.ratingComparison}>
            <h2>Your House Rating vs. Others</h2>
            <div className="chart-container">
              <Bar data={chartData} options={options} />
            </div>
          </div>
        )}

        {showRatingComparison ? (
          <div className={styles.hideRatingContainer}>
            <button className={styles.hideRatingButton} onClick={handleSeeRating}>
              Hide Rating
            </button>
          </div>
        ) : (
          <div className={styles.navigationContainer}>
            <div className={styles.arrowLeft} onClick={handlePreviousImage}>
              ←
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.viewImageButton} onClick={handleToggleQuestions}>
                {showQuestions ? 'View Image' : 'Show Questions'}
              </button>
              {allQuestionsAnswered && (
                <button className={styles.seeRatingButton} onClick={handleSeeRating}>
                  See Rating
                </button>
              )}
            </div>
            <div className={styles.arrowRight} onClick={handleNextImage}>
              →
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinImageQGame;
