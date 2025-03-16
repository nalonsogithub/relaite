import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from '../styles/BinImageQGame.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { useSwipeable } from 'react-swipeable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BinImageQGame = ({ 
  backgroundImages, 
  questions, 
  onAnswersSelected,
  overallRating,  // New parameter for the overall rating
  containerHeight = '600px',  // Default container height
  containerWidth = '800px',   // Default container width
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userSelections, setUserSelections] = useState(
    Array(questions.length).fill().map(() => Array(questions[0]?.length || 0).fill(null))
  );
//const [userSelections, setUserSelections] = useState([]);  											   
												   
												   
  const [showQuestions, setShowQuestions] = useState(true);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [userRating, setUserRating] = useState(null);  // State to hold the calculated user rating
  const [showRatingComparison, setShowRatingComparison] = useState(false);  // State to toggle the rating comparison view

  // Initialize userSelections based on questions when the questions prop is set
//  useEffect(() => {
//    if (questions?.length > 0 && questions[0]?.length > 0) {
//      const initialSelections = Array(questions.length).fill().map(() => Array(questions[0].length).fill(null));
//      setUserSelections(initialSelections);
//    }
//  }, [questions]);												   
												   
												   
  useEffect(() => {
    const areAllAnswered = userSelections.every(imageSelections => 
      imageSelections.every(selection => selection !== null)
    );
    setAllQuestionsAnswered(areAllAnswered);

    if (areAllAnswered) {
        const result = questions.map((questionSet, imageIndex) => {
            return questionSet.map((question, questionIndex) => ({
                question,
                answer: userSelections[imageIndex][questionIndex],
            }));
        });
        onAnswersSelected(result); 
    }
  }, [userSelections]);

  const handleAnswer = (questionIndex, answer) => {
    const newSelections = [...userSelections];
    newSelections[currentImageIndex][questionIndex] = answer;
    setUserSelections(newSelections);
  };

  const handleToggleQuestions = () => {
    setShowQuestions(!showQuestions);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
  };

												   
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + backgroundImages.length) % backgroundImages.length
    );
  };

  const calculateUserRating = () => {
    const totalQuestions = userSelections.flat().length;
    const thumbsUpCount = userSelections.flat().filter(selection => selection === 'up').length;
    const userRating = (thumbsUpCount / totalQuestions) * 10;
    setUserRating(userRating.toFixed(1));  // Scale to 1-10 and round to 1 decimal place
  };

  const handleSeeRating = () => {
    if (allQuestionsAnswered) {
      if (!showRatingComparison) {
        calculateUserRating();
      }
      setShowRatingComparison(!showRatingComparison);  // Toggle the rating comparison view
    }
  };

  const currentQuestions = questions[currentImageIndex] || [];

  // Data for the comparison chart
  const data = {
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
      min: 0,   // Start Y-axis at 0
      max: 10,  // Ensure Y-axis always goes to 10
      ticks: {
        stepSize: 1, // Optional: control the tick interval
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

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePreviousImage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className={styles.container}>
      <div 
        {...swipeHandlers} 
        className={styles.background} 
        style={{ 
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          height: containerHeight,
          width: containerWidth,
        }}
      >	  
        {!showRatingComparison && showQuestions && (
          <div className={styles.grid}>
            {currentQuestions.map((question, index) => (
              <div key={index} className={styles.questionContainer}>
                <p className={styles.question}>{question}</p>
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

        {/* Rating Comparison View */}
        {showRatingComparison && (
          <div className={styles.ratingComparison}>
            <h2>Your House Rating vs. Others</h2>
            <div className="chart-container">
              <Bar data={data} options={options} />
            </div>
          </div>
		)}

        {/* Conditional Rendering of Navigation or Hide Rating Button */}
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
