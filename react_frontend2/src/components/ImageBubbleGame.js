import React, { useState, useEffect, useRef, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import styles from '../styles/ImageBubbleGame.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useImageBubbleGameData } from '../contexts/ImageBubbleGameContext';
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import { useChat } from '../contexts/ChatContext';



const COLORS = ['#5DADE2', '#3498DB', '#AED6F1', '#85C1E9', '#2E86C1', '#2874A6'];

const ImageBubbleGame = ({ gameHeight, gameWidth, onImageBubbleGameAnswersSelected }) => {
  const { loadGameData, dataLoaded,  } = useImageBubbleGameData();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [clickedIndexes, setClickedIndexes] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const [introImage, setIntroImage] = useState(null);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [listOfWords, setListOfWords] = useState([]);
  const [prompt, setPrompt] = useState([]);
  const [answersExpected, setAnswersExpected] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState([]);	
  const { listingJson, imageURL } = useContext(ListingAdminContext);
  const [gameData, setGameData] = useState([]);
  const { 
	context_logUserInteraction
  } = useChat();	

  const isDataProcessed = useRef(false);	

  // Default listOfSelectionFrequency until calculated later
  const [listOfSelectionFrequency, setListOfSelectionFrequency] = useState([
    [10, 10, 10, 10, 10, 10], 
    [10, 10, 10, 10, 10, 10], 
    [10, 10, 10, 10, 10, 10], 
  ]);

  // Function to process the frequencies from backend
  const processFrequencies = (gameData) => {
	console.log('in process Frequencies');
    const frequencies = gameData
      .filter(image => image.image_order > 0)  // Skip the intro image
      .map(image => 
        image.questions.map(question => 
          question.answer_frequencies.map(freq => freq.frequency)  // Extract the frequencies
        )
      );

    // Flatten the frequency array and handle empty arrays
    const flattenedFrequencies = frequencies.map(questionFreqs => 
      questionFreqs.map(freqArr => (freqArr.length > 0 ? freqArr[0] : 0))  // If empty, return 0 as the default frequency
    );

    return flattenedFrequencies;
  };
	
  function buildImageBubbleGameData(listingJson) {
    const bubbleGame = listingJson.games?.image_bubble_game || {};
    const images = [];
    const questions = [];

    console.log('bubbleGame:', bubbleGame);

    // Separate images and questions from the image_bubble_game object
    Object.keys(bubbleGame).forEach((key) => {
      if (key.startsWith('images_')) {
        images.push({ ...bubbleGame[key], key });
      } else if (key.startsWith('questions_')) {
        questions.push(bubbleGame[key]);
      }
    });

    // Remove any potential duplicate questions
    const uniqueQuestions = questions.reduce((acc, current) => {
      const isDuplicate = acc.some(
        (question) => question.question === current.question && question.iqmap === current.iqmap
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

      console.log(`Image ${image.key} associated with questions:`, associatedQuestions);

      return {
        ...image,
        questions: associatedQuestions.map((question) => ({
          question_id: question.question_id || null,
          question: question.question,
          question_order: question.question_order,
          question_type: question.question_type,
          iqmap: question.iqmap,
		  answer_frequencies: question.answer_frequencies || [],
        })),
      };
    });

    return gameData;
  }


useEffect(() => {
  if (listingJson && listingJson.games) {
    const processedGameData = buildImageBubbleGameData(listingJson);

    if (processedGameData && processedGameData.length > 0) {
      console.log('Processed Game Data:', processedGameData);
      setGameData(processedGameData);

      isDataProcessed.current = true;

      const introImg = processedGameData.find((image) => image.image_order === 0);
      const imgs = processedGameData.filter((image) => image.image_order > 0);
      const gameTitle = introImg ? introImg.image_description : '';

      const words = imgs.map((img) =>
        img.questions ? img.questions.map((q) => q.question) : []
      );


      // Updated expectedAnswers logic
      const expectedAnswers = imgs.map((img) => img.number_of_answers_expected || 3);
      const prompts = imgs.map((img) => img.image_description || '');
      const instr = imgs.map(() => 'Choose your impressions and compare them with others.');
      const bgImages = imgs.map(
        (img) =>
          `${imageURL}${listingJson.listing.master_listing_id.toLowerCase()}/${img.image_file}`
      );

//      const expectedAnswers = imgs.map(() => 3);
//      const prompts = imgs.map((img) => img.image_description || '');
//      const instr = imgs.map(() => 'Choose 3 words to describe your first impresssions and compare them with other visitors.');
//      const bgImages = imgs.map(
//        (img) =>
//          `${imageURL}${listingJson.listing.master_listing_id.toLowerCase()}/${img.image_file}`
//      );

      setIntroImage(introImg);
      setImages(imgs);
      setTitle(gameTitle);
      setListOfWords(words);
      setPrompt(prompts);
      setAnswersExpected(expectedAnswers);
      setInstructions(instr);
      setBackgroundImages(bgImages);

      const frequencies = processFrequencies(processedGameData);
      setListOfSelectionFrequency(frequencies);
    } else {
      console.warn('No valid game data found.');
    }
  }
}, [listingJson, imageURL]);
	


  // Dynamic variables only set when gameData is loaded or changes
  useEffect(() => {
    if (dataLoaded && gameData.length > 0 && !isDataProcessed.current) {
		
	  isDataProcessed.current = true;
		
		
      // Extract intro image and the game images from gameData
      const introImg = gameData.find(image => image.image_order === 0);
      const imgs = gameData.filter(image => image.image_order > 0);
      const gameTitle = introImg ? introImg.image_description : '';

      // Build dynamic values from gameData
      const words = imgs.map(img => img.questions.map(q => q.question));
      const expectedAnswers = imgs.map(() => 3); 
		
      const prompts = imgs.map(img => img.image_description);
      const instr = imgs.map(() => "Click on the impressions to see how others responded.");
      const bgImages = imgs.map(img => img.url);

      // Update state variables
      setIntroImage(introImg);
      setImages(imgs);
      setTitle(gameTitle);
      setListOfWords(words);
      setPrompt(prompts);
      setAnswersExpected(expectedAnswers);
      setInstructions(instr);
      setBackgroundImages(bgImages);

      // Process frequencies from the fetched game data
      const frequencies = processFrequencies(gameData);		
	  setListOfSelectionFrequency(frequencies);
		
    }
  }, [dataLoaded, gameData]);
	
	


  const handleIntroClick = () => {
    setShowIntro(false); // Hide the intro when clicked
  };	

	
	
  // Use the state variable directly
  const introImageUrl = introImage
    ? `${imageURL}${listingJson.listing.master_listing_id.toLowerCase()}/${introImage.image_file}`
    : '';	
	
	
  const handleWordClick = (wordIndex) => {

    if (clickedIndexes.includes(wordIndex) || gameEnded) return; // Prevent clicking on already selected words or if the game has ended

    const newClickedIndexes = [...clickedIndexes];
    newClickedIndexes.push(wordIndex);  // Update clicked indexes
    setClickedIndexes(newClickedIndexes);

    // Create a deep copy of listOfSelectionFrequency to safely modify the inner arrays
    const newSelectionFrequency = listOfSelectionFrequency.map(arr => [...arr]);

    // Increment the frequency for the selected word
    newSelectionFrequency[currentQuestionIndex][wordIndex] += 1; 
    setListOfSelectionFrequency(newSelectionFrequency); // Update state

    const selectedWord = listOfWords[currentQuestionIndex][wordIndex];
    const currentQuestion = prompt[currentQuestionIndex]; // Grab the current question text

    // Pass the question and the selected word back through the callback
    onImageBubbleGameAnswersSelected(currentQuestion, selectedWord);

    // Check if the number of clicked indexes matches the expected number of answers
    if (newClickedIndexes.length >= answersExpected[currentQuestionIndex]) {
      context_logUserInteraction('All first impressions answered', null, 'ImageBubbleGame', 'All first impressions answered', null);

      setTimeout(() => {
        showThankYouAlert();
      }, 500); // Short delay to allow the percentage to render
    }
  };

  const showThankYouAlert = () => {
    if (currentQuestionIndex === prompt.length - 1) {
      setShowCharts(true); // Show charts after the last question
    } else {
      handleThankYouClick();
    }
  };

  const handleThankYouClick = () => {
    if (currentQuestionIndex === prompt.length - 1) {
      setGameEnded(true); // End the game after the last question
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setClickedIndexes([]); // Reset for the next question
    }
  };

  const renderSelectedFrequency = (index) => {
    if (!clickedIndexes.includes(index)) return null;

    const frequency = listOfSelectionFrequency[currentQuestionIndex][index];
    const totalSelections = listOfSelectionFrequency[currentQuestionIndex].reduce((a, b) => a + b, 0);
    const percentage = totalSelections > 0 ? (frequency / totalSelections) * 100 : 0;
    return `${percentage.toFixed(2)}%`;
  };
	
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
	  
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const words = name.split(' ');  // Split the label text into words
    const lineHeight = 14;  // Line height for each line of text

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '10px', fontWeight: 'bold' }}
      >
        {words.map((word, i) => (
          <tspan key={i} x={x} y={y + i * lineHeight}>
            {word}
          </tspan>
        ))}
      </text>
    );
  };
//const handleIntroClick = () => setShowIntro(false);

//if (showIntro) {
//  return (
//    <div className={styles.fixedAspectContainer}>
//      <div className={styles.fixedAspectContent} onClick={handleIntroClick}>
//        <img
//          src={introImageUrl}
//          alt="Intro"
//          className={styles.introImage} // Add specific styling for the intro image
//        />
//        <div className={styles.overlay}>
//          <h1 className={styles.title}>First Impression</h1>
//          <button className={styles.playButton}>Play Now</button>
//        </div>
//      </div>
//    </div>
//  );
//}
if (showIntro) {
  return (
    <div className={styles.fixedAspectContainer}>
      <div
        className={`${styles.fixedAspectContent} ${styles.background}`}
        style={{
          backgroundImage: `url(${introImageUrl})`,
        }}
        onClick={handleIntroClick}
      >
        <div className={styles.overlay}>
          <h1 className={styles.title}>First Impression</h1>
          <button className={styles.playButton}>Play Now</button>
        </div>
      </div>
    </div>
  );
}


const renderGridItems = () => {
  // Ensure listOfWords is defined and has a valid index
  if (!listOfWords[currentQuestionIndex] || listOfWords[currentQuestionIndex].length === 0) {
    return null; // Return early if the data is not available
  }

  const totalItems = listOfWords[currentQuestionIndex].length;
  const gridItems = [];

  // Array representing the indices of edge positions in a 4x4 grid
  const edgeIndices = [0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15];

  let wordIndex = 0;

  for (let i = 0; i < 16; i++) {
    if (edgeIndices.includes(i) && wordIndex < totalItems) {
      const index = wordIndex;
      gridItems.push(
        <div
          key={i}
          className={`${styles.gridItem} ${clickedIndexes.includes(wordIndex) ? styles.inactive : ''} ${gameEnded ? styles.inactive : ''}`}
          onClick={() => handleWordClick(index)}
        >
          <div className={styles.wordBelowIcon}>
            {clickedIndexes.includes(index)
              ? renderSelectedFrequency(index)
              : listOfWords[currentQuestionIndex][index]}
          </div>
        </div>
      );
      wordIndex++;
    } else {
      gridItems.push(
        <div key={i} className={styles.gridItem} style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
          {/* Invisible div to maintain 4x4 layout */}
        </div>
      );
    }
  }

  return gridItems;
};

//const renderGridItems = () => {
//  if (!listOfWords[currentQuestionIndex] || listOfWords[currentQuestionIndex].length === 0) {
//    return null;
//  }
//
//  const totalItems = listOfWords[currentQuestionIndex].length;
//  const gridItems = [];
//  const edgeIndices = [0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15];
//  let wordIndex = 0;
//
//  for (let i = 0; i < 16; i++) {
//    if (edgeIndices.includes(i) && wordIndex < totalItems) {
//      const index = wordIndex;
//      gridItems.push(
//        <div
//          key={i}
//          className={`${styles.gridItem} ${clickedIndexes.includes(wordIndex) ? styles.inactive : ''} ${gameEnded ? styles.inactive : ''}`}
//          onClick={() => handleWordClick(index)}
//        >
//          <img
//            src={backgroundImages[currentQuestionIndex]} // Dynamic image
//            alt="Game Image"
//            className={styles.gridImage} // Add styling for the image
//          />
//          <div className={styles.wordBelowIcon}>
//            {clickedIndexes.includes(index)
//              ? renderSelectedFrequency(index)
//              : listOfWords[currentQuestionIndex][index]}
//          </div>
//        </div>
//      );
//      wordIndex++;
//    } else {
//      gridItems.push(
//        <div key={i} className={styles.gridItem} style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
//          {/* Invisible div to maintain 4x4 layout */}
//        </div>
//      );
//    }
//  }
//
//  return gridItems;
//};


const renderPieCharts = () => {
  context_logUserInteraction('renderPieCharts', null, 'ImageBubbleGame', 'see pie charts', null);

  const chartWidth = getComputedStyle(document.documentElement).getPropertyValue('--pie-chart-width');
  const chartHeight = getComputedStyle(document.documentElement).getPropertyValue('--pie-chart-height');
  const outerRadius = getComputedStyle(document.documentElement).getPropertyValue('--pie-chart-outer-radius');

  return listOfWords.map((questionWords, qIndex) => {
    const data = questionWords.map((word, wIndex) => ({
      name: word,
      value: listOfSelectionFrequency[qIndex][wIndex]
    }));

    return (
      <div key={qIndex} className={styles.chartContainer}>
        <div className={styles.promptContainer}>
          <h3 className={styles.chartHeader}>{prompt[qIndex]}</h3>
        </div>
        <div className={styles.pieChartWrapper}>
          <PieChart width={parseInt(chartWidth)} height={parseInt(chartHeight)} className={styles.pieChart}>
            <Pie
              data={data}
              cx="50%"  // Center horizontally
              cy="50%"  // Center vertically
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    );
  });
};

  if (showCharts) {
    return (
      <div className={styles.pieChartContainer}>  {/* Use the new CSS class */}
        <h2>Summary of Responses</h2>
        {renderPieCharts()}
      </div>
    );
  } else {
  }



	return (
	  <div className={styles.fixedAspectContainer}>
		<div className={styles.fixedAspectContent}>
		  <div
			className={`${styles.background}`}
			style={{
			  backgroundImage: `url(${backgroundImages[currentQuestionIndex]})`,
			}}
		  >
			<div className={styles.gridContainer}>{renderGridItems()}</div>
		  </div>
		</div>
	  </div>
	);


};

export default ImageBubbleGame;
