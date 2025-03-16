import React from 'react';
import { ReactFloatingBalloons } from 'react-floating-balloons';
import '../styles/FloatingQuestionBalloons.module.css';

const FloatingQuestionBalloons = () => {
  const supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

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

  const handleAnswer = (answer) => {
    console.log('Selected answer:', answer);
  };

  return (
    <div className="App">
      <h1>ReactFloatingBalloons 🎈</h1>
      {supportsTouch ? (
        <h2>Click the balloons to pop 💥</h2>
      ) : (
        <h2>Double Click the balloons to pop 💥</h2>
      )}
      <ReactFloatingBalloons
        count={questionsData.length}
        msgText="Yayy!!"
        colors={["yellow"]}
        popVolumeLevel={0.1}
        renderBalloons={() =>
          questionsData.map((item, index) => (
            <div key={index} className="question-card">
              <p>{item.question}</p>
              {item.answers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(answer)}
                  className="answer-button"
                >
                  {answer}
                </button>
              ))}
            </div>
          ))
        }
      />
    </div>
  );
};

export default FloatingQuestionBalloons;
