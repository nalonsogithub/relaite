import React, { useState, useEffect, useRef, useContext  } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from '../styles/BinImageQGame.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { useSwipeable } from 'react-swipeable';
import { useBinQGameImages } from '../contexts/BinQGameContext';
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import { useChat } from '../contexts/ChatContext';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BinImageQGame = ({ 
  onAnswersSelected = () => {},
  containerHeight = '600px',
  containerWidth = '800px',
  onImageChange = () => {}, // Properly destructured and with a default value
  }) => {	
  const { loadGameData, dataLoaded,  getAnswerPercentages } = useBinQGameImages();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userSelections, setUserSelections] = useState([]);
  const [showQuestions, setShowQuestions] = useState(true);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [overallRating, setOverallRating] = useState(null);
  const [showRatingComparison, setShowRatingComparison] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const intervalRef = useRef(null);
  const { listingJson, imageURL, LoadBinGameImages } = useContext(ListingAdminContext); // Access context
  const [gameData, setGameData] = useState([]);  

  const { 
	context_logUserInteraction
  } = useChat();	
	
	
	
  // Function to reset the auto-scroll timer
  const resetAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear the existing interval
    }

    if (isAutoScrollEnabled) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % gameData.length);
      }, 5000); // Restart the interval for auto-scrolling
    }
  };	
	
function buildGameData(listingJson) {
  const binGame = listingJson.games?.bin_game || {};
  const images = [];
  const questions = [];

  
//  console.log('binGame:', binGame);
  
  // Separate images and questions from the bin_game object
  Object.keys(binGame).forEach((key) => {
    if (key.startsWith('images_')) {
      images.push({ ...binGame[key], key });
    } else if (key.startsWith('questions_')) {
      questions.push(binGame[key]);
    }
  });

  // Log the initial images and questions to verify input data
//  console.log('Initial Images:', images);
//  console.log('Initial Questions:', questions);  
  
  // Remove any potential duplicate questions
  const uniqueQuestions = questions.reduce((acc, current) => {
    const isDuplicate = acc.some(question => 
      question.question === current.question &&
      question.iqmap === current.iqmap
    );
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Create the final structured array
  const gameData = images.map((image) => {
    const associatedQuestions = uniqueQuestions.filter(
      (question) => question.iqmap === image.iqmap
    );

    // Log to verify that questions are correctly associated and unique
    console.log(`Image ${image.key} associated with questions:`, associatedQuestions);

    return {
      ...image,
      questions: associatedQuestions.map((question) => ({
        question_id: question.question_id || null,
        question: question.question,
        question_order: question.question_order,
        question_type: question.question_type,
        iqmap: question.iqmap,
      })),
    };
  });

  return gameData;
}



  useEffect(() => {
    const fetchData = async () => {
    try {
//        console.log('PRE Answer Percentages');
      const percentages = await getAnswerPercentages();
      if (percentages) {
        const { up_scaled, down_scaled } = percentages;

        // Calculate overallRating
        const total = up_scaled + down_scaled;
        if (total > 0) {
          const calculatedRating = (up_scaled / total) * 10; // Calculate the overall rating scaled between 1 and 10
          setOverallRating(calculatedRating);
        } else {
          setOverallRating(0); // If no answers, set to 0
        }
      }		  
    } catch (error) {
      console.error('Error in fetching answer percentages:', error);
      setOverallRating(0); // Default to 0 if there's an error
    }		  
  };

    fetchData();
  }, [getAnswerPercentages]);  
	
  useEffect(() => {
    // Ensure listingJson is loaded before building the game data
    if (listingJson && listingJson.games) {
      const binGameData = buildGameData(listingJson); // Call the function here
//      console.log('Bin Game Data:', binGameData);
      setGameData(binGameData); // Set the structured game data
    }
  }, [listingJson]); // Ensure this runs whenever listingJson changes
	

	
  // Log or operate on gameData only after it has been updated
  useEffect(() => {
    if (gameData?.length > 0) {
      const initialSelections = gameData.map(image => Array(image.questions.length).fill(null));

//      const initialSelections = Array(gameData.length).fill().map(() => Array(gameData[0].questions.length).fill(null));
      setUserSelections(initialSelections);
    }
  }, [gameData]);
		

	useEffect(() => {
		if (gameData.length > 0) {
			console.log('Checking All Questions Answered');
			const areAllQuestionsAnswered = userSelections.every(imageSelections =>
				imageSelections.every(selection => selection !== null)
			);
			setAllQuestionsAnswered(areAllQuestionsAnswered);
		}
	}, [userSelections, gameData]);


  // This useEffect will trigger when currentImageIndex changes
  useEffect(() => {
    if (gameData && gameData.length > 0) {
      const imageDescription = gameData[currentImageIndex].image_description;
      if (onImageChange) {
        onImageChange(imageDescription);  // Automatically trigger image description change
      }
    }
  }, [currentImageIndex, gameData, onImageChange]);		
		

  // Handle auto-scroll using setInterval
  useEffect(() => {
    let intervalId;

    if (isAutoScrollEnabled) {
      resetAutoScroll(); // Change image every 5 seconds
    }

    // Cleanup interval on component unmount or when auto-scroll is disabled
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoScrollEnabled, gameData.length]);		
		
		
		
  const handleAnswer = (questionIndex, answer) => {
    const newSelections = [...userSelections];
    newSelections[currentImageIndex][questionIndex] = answer;
    setUserSelections(newSelections);
	resetAutoScroll();

    // Pass the selected question and thumbs up/down back to the parent component
    const selectedQuestion = gameData[currentImageIndex].questions[questionIndex].question;
    onAnswersSelected(selectedQuestion, answer); // Added this line to pass the question and answer back to the parent
		
		
    // After the answer is selected, check if all questions for the image are answered
    const areAllAnsweredForImage = newSelections[currentImageIndex].every(selection => selection !== null);
    if (areAllAnsweredForImage) {
      setTimeout(() => {
        handleNextImage();
      }, 300);  
    }
  };
		
		
  const handleToggleQuestions = () => {
    setShowQuestions(!showQuestions);
    setIsAutoScrollEnabled((prevState) => !prevState);		
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % gameData.length);
		
    // This passes back the Image Description back 		
    if (gameData && gameData.length > 0) {
      const imageDescription = gameData[currentImageIndex].image_description;
	}
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
	  context_logUserInteraction('See Rating', null, 'BinImageGAme', 'see rating', null);
      if (!showRatingComparison) {
        calculateUserRating();
      }
      setShowRatingComparison(!showRatingComparison);
      setIsAutoScrollEnabled((prevState) => !prevState);		
    }

  };

  // Ensure `useSwipeable` is called unconditionally at the top
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePreviousImage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });


  const currentImage = gameData[currentImageIndex]
    ? `${imageURL}${listingJson.listing.master_listing_id.toLowerCase()}/${gameData[currentImageIndex].image_file}`
    : '';
  const currentQuestions = gameData[currentImageIndex]?.questions || [];

  // Data for the comparison chart
  const chartData = {
    labels: ['User Rating', 'Overall Rating'],
    datasets: [
      {
        label: 'Rating',
        data: [userRating !== null ? userRating : 0, overallRating !== null ? overallRating : 0], // Fallback to 0 if null
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
					  className={`${styles.iconButton} ${(userSelections[currentImageIndex] && userSelections[currentImageIndex][index] === 'up') ? styles.selected : ''}`}
					  onClick={() => handleAnswer(index, 'up')}
					>
					  <FontAwesomeIcon icon={faThumbsUp} />
					</button>
					<button
					  className={`${styles.iconButton} ${(userSelections[currentImageIndex] && userSelections[currentImageIndex][index] === 'down') ? styles.selected : ''}`}
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

        {showRatingComparison && (
          <div className={styles.hideRatingContainer}>
            <button className={styles.hideRatingButton} onClick={handleSeeRating}>
              Hide Rating
            </button>
          </div>
        )}
{/*
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
*/}
      </div>
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


    </div>
  );
};

export default BinImageQGame;
