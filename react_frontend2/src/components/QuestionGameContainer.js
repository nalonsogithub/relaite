import React from 'react';
import QuestionGame from './QuestionGame';

const questions = [
  {
    question: "Why are you buying a home?",
    answers: ["Work", "School", "Size", "Renting", "Investment", "Kids", "Dogs", "Lifestyle", "New Look", "Refresh", "Change", "Why Not"],
    requiredAnswers: 3
  },
  {
    question: "First impression?",
    answers: ["Spacious", "Quaint", "Modern", "Noisy", "Elegant", "Cramped", "Bright", "Overgrown", "Peaceful", "Dated", "Stylish", "Cluttered", "Airy", "Cold", "Busy", "Dark", "Meticulous", "Rustic", "Dreary", "Sparse", "Impressive", "Functional", "Stuffy", "Uninspiring", "Outdated", "Fresh", "Sleek", "Traditional", "Picturesque", "Confining"],
    requiredAnswers: 3
  }
];

const QuestionGameContainer = () => {
  const handleComplete = (selectedAnswers) => {
    console.log('Selected Answers:', selectedAnswers);
    // Perform any additional actions with the selected answers here
  };

  return (
    <QuestionGame
      questions={questions}
      numBalloons={3}
      verticalSpeed={5}
      horizontalSpeed={3}
      balloonColors={["darkblue", "lightgreen", "lightblue", "yellow", "darkblue"]} // Color names should match the image filenames
      balloonSize="medium" // Change this to 'small', 'medium', or 'large'
      onComplete={handleComplete} // Pass the callback function
    />
  );
};

export default QuestionGameContainer;
