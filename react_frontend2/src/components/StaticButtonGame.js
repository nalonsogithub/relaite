import React, { useState, useEffect } from 'react';
import styles from '../styles/StaticButtonGame.module.css';

const StaticButtonGame = ({ questionsList, balloonImages, instanceId, onAnswerSelected }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(Array(16).fill(true)); // State to track which items are visible
  const [selectedCount, setSelectedCount] = useState(0);
  const [answersDictionary, setAnswersDictionary] = useState({}); // State to track all selected answers

  const currentQuestion = questionsList[currentQuestionIndex];
  const { question, answers, required_responses, thank_you_message } = currentQuestion;

  const handleItemClick = (index) => {
    const newVisibleItems = [...visibleItems];
    newVisibleItems[index] = false;
    setVisibleItems(newVisibleItems);

    const clickedWord = answers[index];
    const newAnswers = { ...answersDictionary };

    if (newAnswers[question]) {
      newAnswers[question].push(clickedWord);
    } else {
      newAnswers[question] = [clickedWord];
    }

    setAnswersDictionary(newAnswers);
    console.log('Updated Answers Dictionary:', newAnswers);

    setSelectedCount((prevCount) => {
      const newCount = prevCount + 1;

      if (newCount === required_responses) {
        // Send the entire dictionary back to the parent component
        onAnswerSelected(newAnswers);

        // Proceed to the next question or display thank you message
        if (currentQuestionIndex + 1 < questionsList.length) {
          setTimeout(() => {
            setSelectedCount(0);
            setVisibleItems(Array(16).fill(true)); // Reset visible items
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          }, 500);
        } else {
          alert(thank_you_message);
        }
      }

      return newCount;
    });
  };

  useEffect(() => {
    // Reset visible items when the question changes
    setVisibleItems(Array(16).fill(true));
  }, [currentQuestionIndex]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.questionContainer}>
        <div className={styles.questionContainerTopRow}>
          <div className={styles.logoContainer}>
            <img
              src="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/REALESTATE_blue.png"
              alt="Open House AIgent. A product from REAL ESTaiTE"
              className={styles.logoImage}
            />
          </div>

          <div className={styles.instructions}>
            We value your feedback! If you have a moment, please answer a few questions to help us improve your experience.
          </div>
        </div>
        <div className={styles.actualQuestion}>
          {question}
        </div>
      </div>

      <div className={styles.gridContainer}>
        {answers.slice(0, 16).map((answer, index) => (
          <div
            className={styles.gridItem}
            key={`${instanceId}_gridItem${index}`}
            onClick={() => visibleItems[index] && handleItemClick(index)}
          >
            <img
              src={balloonImages[index % balloonImages.length]}
              alt="balloon"
              className={`${styles.gridImage} ${!visibleItems[index] ? styles.hidden : ''}`}
            />
            <div className={`${styles.gridText} ${!visibleItems[index] ? styles.hidden : ''}`}>
              {answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaticButtonGame;
