import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterval } from 'react-use';
import styles from '../styles/floatingWords.module.css';

const questionsData = [
  {
    question: "Why are you buying a home?",
    answers: ["Work", "School", "Size", "Renting", "Investment", "Kids", "Dogs", "Lifestyle", "New Look", "Refresh", "Change", "Why Not"],
  },
  {
    question: "First impression?",
    answers: ["Spacious", "Quaint", "Modern", "Noisy", "Elegant", "Cramped", "Bright", "Overgrown", "Peaceful", "Dated", "Stylish", "Cluttered", "Airy", "Cold", "Busy", "Dark", "Meticulous", "Rustic", "Dreary", "Sparse", "Impressive", "Functional", "Stuffy", "Uninspiring", "Outdated", "Fresh", "Sleek", "Traditional", "Picturesque", "Confining"],
  },
];

const FloatingWords = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(questionsData[currentQuestionIndex].answers.slice(0, 4));
  const [positions, setPositions] = useState([]);
  const [velocities, setVelocities] = useState([]);
  const [clickOrder, setClickOrder] = useState([]);
  const containerRef = useRef(null);
  const [allAnswers, setAllAnswers] = useState(questionsData[currentQuestionIndex].answers);
  const [usedAnswers, setUsedAnswers] = useState([]);

  useEffect(() => {
    initializePositionsAndVelocities();
  }, [currentQuestionIndex]);

  const initializePositionsAndVelocities = () => {
    const initialPositions = Array(4).fill().map((_, index) => getInitialPosition(index));
    const initialVelocities = Array(4).fill().map(() => getVelocity());
    setPositions(initialPositions);
    setVelocities(initialVelocities);
  };

  const getInitialPosition = (index) => {
    const top = 90; // Start at the bottom
    const left = getColumnPosition(index);
    return { top, left };
  };

  const getColumnPosition = (index) => {
    // Divide the container into 4 equally spaced columns
    const columnWidth = 100 / 4; // 100% width for columns
    return columnWidth * index + columnWidth / 2; // column position + half column width
  };

  const getVelocity = () => {
    const topVelocity = -(Math.random() * 0.3 + 0.2); // Random upward speed
    return { top: topVelocity };
  };

  useInterval(() => {
    setPositions((prevPositions) =>
      prevPositions.map((pos, index) => {
        let newTop = pos.top + velocities[index].top;
        if (newTop < 0) {
          if (currentQuestionIndex === questionsData.length - 1) {
            const nextAnswer = allAnswers.shift();
            setUsedAnswers((prev) => [...prev, nextAnswer]);
            setAllAnswers((prev) => [...prev, nextAnswer]);
            setAnswers((prev) => [...prev.slice(1), nextAnswer]);
            return getInitialPosition(index);
          } else {
            const nextAnswer = allAnswers.shift();
            setUsedAnswers((prev) => [...prev, nextAnswer]);
            setAnswers((prev) => [...prev.slice(1), nextAnswer]);
            return getInitialPosition(index);
          }
        }
        return { top: newTop, left: pos.left };
      })
    );
  }, 50); // Adjust interval for smoother animation

  const handleWordClick = (word, index) => {
    if (currentQuestionIndex === questionsData.length - 1) {
      setClickOrder((prevOrder) => [...prevOrder, word]);
      console.log([...clickOrder, word]);
      setAnswers((prevAnswers) => prevAnswers.filter((_, i) => i !== index));
      if (allAnswers.length > 0) {
        const nextAnswer = allAnswers.shift();
        setUsedAnswers((prev) => [...prev, nextAnswer]);
        setAllAnswers((prev) => [...prev, nextAnswer]);
        setAnswers((prev) => [...prev, nextAnswer]);
        setPositions((prevPositions) => [...prevPositions.slice(0, index), getInitialPosition(index), ...prevPositions.slice(index + 1)]);
        setVelocities((prevVelocities) => [...prevVelocities.slice(0, index), getVelocity(), ...prevVelocities.slice(index + 1)]);
      }
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setAnswers(questionsData[currentQuestionIndex + 1].answers.slice(0, 4));
      setAllAnswers(questionsData[currentQuestionIndex + 1].answers);
    }
  };

  useEffect(() => {
    setAnswers(questionsData[currentQuestionIndex].answers.slice(0, 4));
    initializePositionsAndVelocities();
  }, [currentQuestionIndex]);

  return (
    <div className={styles.floatingWordsContainer} ref={containerRef}>
      <div className={styles.questionArea}>
        <h2 className={styles.questionText}>{questionsData[currentQuestionIndex].question}</h2>
      </div>
      <AnimatePresence>
        {answers.map((answer, index) => (
          <motion.div
            key={answer}
            className={styles.floatingWord}
            style={{
              top: `${positions[index]?.top}%`,
              left: `${positions[index]?.left}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.5 } }}
            onClick={() => handleWordClick(answer, index)}
            whileTap={{ scale: 1.2 }} // Popping effect on click
          >
            {answer}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingWords;
