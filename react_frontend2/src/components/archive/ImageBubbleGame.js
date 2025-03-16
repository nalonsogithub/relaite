// ImageBubbleGame.js

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import styles from '../styles/ImageBubbleGame.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const COLORS = ['#5DADE2', '#3498DB', '#AED6F1', '#85C1E9', '#2E86C1', '#2874A6'];

const ImageBubbleGame = (
  { 
	introImage,
    backgroundImages, 
    listOfWords, 
    listOfUnselectedHoverImages, 
    listOfSelectedHoverImages, 
    listOfSelectionFrequency, 
    gameHeight, 
    gameWidth, 
    answersExpected, 
    thankYouMessage, 
    prompt,
    instructions,
    onAnswersSelected // New callback function prop
  }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [clickedIndexes, setClickedIndexes] = useState([]);
  const [gameEnded, setGameEnded] = useState(false); // Track if the game has ended
  const [showCharts, setShowCharts] = useState(false); // Track if pie charts should be shown
  const [showIntro, setShowIntro] = useState(true);
  
  useEffect(() => {
    if (clickedIndexes.length === answersExpected[currentQuestionIndex]) {
      const selectedWords = clickedIndexes.map(index => listOfWords[currentQuestionIndex][index]);
      onAnswersSelected(prompt[currentQuestionIndex], selectedWords);
    }
  }, [clickedIndexes, currentQuestionIndex, listOfWords, prompt, answersExpected, onAnswersSelected]);

  const handleIntroClick = () => {
    setShowIntro(false); // Hide the intro when clicked
  };	
	
const handleWordClick = (wordIndex) => {
  console.log('handleWordClick:', wordIndex, clickedIndexes); // Debugging log

  if (clickedIndexes.includes(wordIndex) || gameEnded) return; // Prevent clicking on already selected words or if the game has ended

  console.log('Hey Clicked word index:', wordIndex); // Debugging log
  const newClickedIndexes = [...clickedIndexes, wordIndex];
  console.log('New clicked indexes:', newClickedIndexes); // Debugging log
  
  setClickedIndexes(newClickedIndexes);
	
  const newSelectionFrequency = [...listOfSelectionFrequency];
  newSelectionFrequency[currentQuestionIndex][wordIndex] += 1;

  const selectedWord = listOfWords[currentQuestionIndex][wordIndex];
  console.log(`Selected Word: ${selectedWord}`);

  if (newClickedIndexes.length >= answersExpected[currentQuestionIndex]) {
    setTimeout(() => {
      console.log('In Pause');
      showThankYouAlert();
    }, 500); // Short delay to allow the percentage to render
  }
};

  const showThankYouAlert = () => {
    if (currentQuestionIndex === prompt.length - 1) {
      setShowCharts(true); // Show charts after the last question
    } else {
//      window.alert(thankYouMessage[currentQuestionIndex]);
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
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {words.map((word, i) => (
          <tspan key={i} x={x} y={y + i * lineHeight}>
            {word}
          </tspan>
        ))}
      </text>
    );
};

  if (showIntro) {
    return (
      <div className={styles.centerContainer}>
        <div className={styles.floatingContainer} onClick={handleIntroClick}>
          <img
            src={introImage}
            alt="Intro"
            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
          />
          <div className={styles.overlay}>
            <h1 className={styles.title}>First Impression</h1>
            <button className={styles.playButton}>Play Now</button>
          </div>
        </div>
      </div>
    );
  }


const renderGridItems = () => {
  const totalItems = listOfWords[currentQuestionIndex].length;
  const gridItems = [];

  // Array representing the indices of edge positions in a 4x4 grid
  const edgeIndices = [0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15];

  let wordIndex = 0;

  for (let i = 0; i < 16; i++) {
    if (edgeIndices.includes(i) && wordIndex < totalItems) {
	  const index = wordIndex;
      // Use a block scope with let to ensure wordIndex is correctly captured
      gridItems.push(
        <div
          key={i}
          className={`${styles.gridItem} ${clickedIndexes.includes(wordIndex) ? styles.inactive : ''} ${gameEnded ? styles.inactive : ''}`}
          onClick={() => handleWordClick(index)}
        >
          <div className={styles.wordBelowIcon}>
            {clickedIndexes.includes(index) 
              ? renderSelectedFrequency(index)  : listOfWords[currentQuestionIndex][index]} 
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


const renderPieCharts = () => {
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
  }



  return (
    <div className={styles.gameContainer} style={{ height: gameHeight, width: gameWidth }}>
      <div className={styles.promptContainer}>
        <div className={styles.prompt}>{prompt[currentQuestionIndex]}</div>
        <div className={styles.instructions}>{instructions[currentQuestionIndex]}</div>
      </div>
      <div className={styles.background} style={{ backgroundImage: `url(${backgroundImages[currentQuestionIndex]})`, padding: '20px' }}>
<div className={styles.gridContainer}>
  {renderGridItems()}
</div>

      </div>
    </div>
  );
};

export default ImageBubbleGame;
