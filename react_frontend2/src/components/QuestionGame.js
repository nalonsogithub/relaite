import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/QuestionGame.module.css';

const baseUrl = "https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE";

const QuestionGame = ({ questions, numBalloons, balloonColors, balloonSize, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [balloons, setBalloons] = useState([]);
  const [remainingAnswers, setRemainingAnswers] = useState([]);

  useEffect(() => {
    if (questions.length > 0) {
      const initialAnswers = questions[currentQuestionIndex].answers.slice();
      setRemainingAnswers(initialAnswers);
      setBalloons(initialAnswers.slice(0, numBalloons));
    }
  }, [currentQuestionIndex, questions, numBalloons]);

  const handleBalloonClick = (answer) => {
    console.log('Selected Answer:', answer);
    const newSelectedAnswers = [...selectedAnswers, answer];
    setSelectedAnswers(newSelectedAnswers);

    const updatedRemainingAnswers = remainingAnswers.filter(a => a !== answer);
    setRemainingAnswers(updatedRemainingAnswers);

    const newBalloons = updatedRemainingAnswers.slice(0, numBalloons);
    setBalloons(newBalloons);

    if (newSelectedAnswers.length >= questions[currentQuestionIndex].requiredAnswers) {
      if (currentQuestionIndex + 1 < questions.length) {
        onComplete(newSelectedAnswers); // Call the callback function with the selected answers
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswers([]);
      } else {
        onComplete(newSelectedAnswers); // Call the callback function with the selected answers
        alert('You have completed all questions!');
      }
    }
  };

  if (questions.length === 0) {
    return <div>No questions available</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={styles.questionGame}>
      <div className={styles.question}>
        {currentQuestion.question}
      </div>
      <div className={styles.balloons}>
        {balloons.map((answer, index) => (
          <Balloon
            key={index}
            text={answer}
            color={balloonColors[index % balloonColors.length]}
            size={balloonSize}
            onClick={() => handleBalloonClick(answer)}
          />
        ))}
      </div>
    </div>
  );
};

const Balloon = ({ text, color, size, onClick }) => {
  const balloonRef = useRef(null);

  useEffect(() => {
    const balloon = balloonRef.current;
    if (balloon) {
      const textLength = text.length;
      const baseSize = size === 'small' ? 60 : size === 'medium' ? 100 : size === 'large' ? 140 : 100;
      const adjustedSize = Math.max(baseSize, textLength * 8); // Adjust size based on text length
      balloon.style.width = `${adjustedSize}px`;
      balloon.style.bottom = '0'; // Ensure the balloon starts from the bottom
      balloon.style.visibility = 'visible'; // Ensure the balloon is visible
      balloon.style.animationDelay = '0s'; // No delay before starting the float animation
    }
  }, [text, size]);

  const handleClick = () => {
    onClick();
    if (balloonRef.current) {
      balloonRef.current.style.visibility = 'hidden'; // Immediately hide the balloon
    }
  };

  return (
    <div
      ref={balloonRef}
      onClick={handleClick}
      className={`${styles.balloonContainer} ${styles[`balloonContainer${Math.floor(Math.random() * 6) + 1}`]}`}
    >
      <img src={`${baseUrl}/${color}_balloon.gif`} alt={`${color} balloon`} className={styles.balloonImage} />
      <div className={styles.balloonText}>
        {text}
      </div>
    </div>
  );
};

export default QuestionGame;
