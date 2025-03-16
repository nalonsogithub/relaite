import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/QuestionCard.module.css';

const QuestionCard = ({ question, answers, onAnswer }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    setTimeout(() => {
      onAnswer(answer);
      setIsFlipped(false);
      setSelectedAnswer(null);
    }, 1000);
  };

  return (
    <motion.div
      className={`card ${isFlipped ? 'flipped' : ''}`}
      onClick={handleCardClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!isFlipped ? (
        <div className="card-front">
          <p>{question}</p>
        </div>
      ) : (
        <div className="card-back">
          {answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              className={`answer-button ${selectedAnswer === answer ? 'selected' : ''}`}
            >
              {answer}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
