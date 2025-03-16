import React from 'react';
import QuestionCard from './QuestionCard';
import '../styles/FloatingQuestionCards.module.css';

const questionsData = [
  {
    question: 'What is your favorite color?',
    answers: ['Red', 'Blue', 'Green', 'Yellow'],
  },
  {
    question: 'What is your favorite animal?',
    answers: ['Dog', 'Cat', 'Bird', 'Fish'],
  },
  {
    question: 'What is your favorite food?',
    answers: ['Pizza', 'Burger', 'Salad', 'Pasta'],
  },
];

const FloatingQuestionCards = () => {
  const handleAnswer = (answer) => {
    console.log('Selected answer:', answer);
  };

  return (
    <div className="floating-cards-container">
      {questionsData.map((item, index) => (
        <QuestionCard
          key={index}
          question={item.question}
          answers={item.answers}
          onAnswer={handleAnswer}
        />
      ))}
    </div>
  );
};

export default FloatingQuestionCards;
