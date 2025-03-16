import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/FloatingQuestionGame.module.css';

const FloatingQuestionGame = ({ questionsList, balloonImages, numberOfContainers = 3, containerScale = 1, instanceId, wrapperHeight = '500px', rightOffset = 100, onAnswerSelected }) => {

  const gameContainerRef = useRef(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [visibleContainers, setVisibleContainers] = useState([]);
  const [showThankYou, setShowThankYou] = useState(false);	

  const currentQuestion = questionsList[currentQuestionIndex];
  const { question, answers, required_responses, thank_you_message  } = currentQuestion;

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * balloonImages.length);
    return balloonImages[randomIndex];
  };

  const initializeContainers = () => {
    const initialContainers = answers.slice(0, numberOfContainers).map((answer, index) => ({
      id: `${instanceId}_floatContainer${index + 1}`,
      text: answer,
      key: `${instanceId}_floatContainer${index + 1}`,
      delay: Math.random() * 5 + 1,
      image: getRandomImage() // Assign a random image from the balloonImages list
    }));
//    console.log('Initializing containers:', initialContainers);
    setVisibleContainers(initialContainers);
  };

  const hideAllContainers = () => {
    const gameContainer = gameContainerRef.current;
    const floatContainers = gameContainer.getElementsByClassName(styles.floatContainer);
//    console.log('Hiding containers:', floatContainers);
    Array.from(floatContainers).forEach(container => {
//      console.log('Hiding container:', container);
      container.style.visibility = 'hidden';
    });
  };

  const removeAllContainers = () => {
    const gameContainer = gameContainerRef.current;
//    console.log('PRE REMOVING:', gameContainer.children);
    while (gameContainer.firstChild) {
//      console.log('REMOVING:', gameContainer.firstChild);
      gameContainer.removeChild(gameContainer.firstChild);
    }
//    console.log('POST REMOVING:', gameContainer.children);
  };

  useEffect(() => {
//    console.log('questionsList received:', questionsList);
  }, [questionsList]);	
	
	
  useEffect(() => {
//    console.log('Question changed: Initializing containers');

    // Hide and remove all existing floating containers
    hideAllContainers();
    setTimeout(() => {
      removeAllContainers();
      setVisibleContainers([]);
      initializeContainers();
    }, 100);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const createAnimationPaths = (gameContainerWidth, gameContainerHeight) => {
      return [
        `@keyframes float-path1 {
          0% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 1}px); opacity: .8;}
          10% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.97}px); opacity: .8;}
          20% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.93}px); opacity: .8;}
          30% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.87}px); opacity: .8;}
          40% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.80}px); opacity: .8;}
          50% { transform: translate(${gameContainerWidth * 0.2}px, ${gameContainerHeight * 0.70}px); opacity: .8;}
          60% { transform: translate(${gameContainerWidth * 0.1}px, ${gameContainerHeight * 0.60}px); opacity: .8;}
          70% { transform: translate(${gameContainerWidth * 0.0}px, ${gameContainerHeight * 0.47}px); opacity: .8;}
          80% { transform: translate(${gameContainerWidth * 0.1}px, ${gameContainerHeight * 0.33}px); opacity: .8;}
          90% { transform: translate(${gameContainerWidth * 0.0}px, ${gameContainerHeight * 0.17}px); opacity: .8;}
          100% { transform: translate(${gameContainerWidth * 0.1}px, ${gameContainerHeight *0.00}px); opacity: .8;}
        }`,
        `@keyframes float-path2 {
          0% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 1}px); opacity: .9;}
          10% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.97}px); opacity: .9;}
          20% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 0.93}px); opacity: .9;}
          30% { transform: translate(${gameContainerWidth * 0.8}px, ${gameContainerHeight * 0.87}px); opacity: .9;}
          40% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 0.80}px); opacity: .9;}
          50% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.70}px); opacity: .9;}
          60% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.60}px); opacity: .9;}
          70% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.47}px); opacity: .9;}
          80% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.33}px); opacity: .9;}
          90% { transform: translate(${gameContainerWidth * 0.2}px, ${gameContainerHeight * 0.17}px); opacity: .9;}
          100% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.00}px); opacity: .9;}
        }`,
        `@keyframes float-path3 {
          0% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 1}px); opacity: .85;}
          10% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.97}px); opacity: .85;}
          20% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.93}px); opacity: .85;}
          30% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.87}px); opacity: .85;}
          40% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 0.80}px); opacity: .85;}
          50% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.70}px); opacity: .85;}
          60% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.60}px); opacity: .85;}
          70% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.47}px); opacity: .85;}
          80% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 0.33}px); opacity: .85;}
          90% { transform: translate(${gameContainerWidth * 0.8}px, ${gameContainerHeight * 0.17}px); opacity: .85;}
          100% { transform: translate(${gameContainerWidth * 1 - rightOffset*containerScale}px, ${gameContainerHeight * 0.00}px); opacity: .85;}
        }`,
        `@keyframes float-path4 {
          0% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 1}px); opacity: .78;}
          10% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.97}px); opacity: .78;}
          20% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.93}px); opacity: .78;}
          30% { transform: translate(${gameContainerWidth * 0.2}px, ${gameContainerHeight * 0.87}px); opacity: .78;}
          40% { transform: translate(${gameContainerWidth * 0.1}px, ${gameContainerHeight * 0.80}px); opacity: .78;}
          50% { transform: translate(${gameContainerWidth * 0.0}px, ${gameContainerHeight * 0.70}px); opacity: .78;}
          60% { transform: translate(${gameContainerWidth * 0.1}px, ${gameContainerHeight * 0.60}px); opacity: .78;}
          70% { transform: translate(${gameContainerWidth * 0.2}px, ${gameContainerHeight * 0.47}px); opacity: .78;}
          80% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.33}px); opacity: .78;}
          90% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.17}px); opacity: .78;}
          100% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.00}px); opacity: .78;}
        }`,
        `@keyframes float-path5 {
          0% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 1}px); opacity: .88;}
          10% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.97}px); opacity: .88;}
          20% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.93}px); opacity: .88;}
          30% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.87}px); opacity: .88;}
          40% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.80}px); opacity: .88;}
          50% { transform: translate(${gameContainerWidth * 0.2}px, ${gameContainerHeight * 0.70}px); opacity: .88;}
          60% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.60}px); opacity: .88;}
          70% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.47}px); opacity: .88;}
          80% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.33}px); opacity: .88;}
          90% { transform: translate(${gameContainerWidth * 0.2}px, ${gameContainerHeight * 0.17}px); opacity: .88;}
          100% { transform: translate(${gameContainerWidth * 0.1}px, ${gameContainerHeight * 0.00}px); opacity: .88;},
        }`,
        `@keyframes float-path6 {
          0% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 1}px); opacity: .83;}
          10% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.97}px); opacity: .83;}
          20% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.93}px); opacity: .83;}
          30% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.87}px); opacity: .83;}
          40% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 0.80}px); opacity: .83;}
          50% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.70}px); opacity: .83;}
          60% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.60}px); opacity: .83;}
          70% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.47}px); opacity: .83;}
          80% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.33}px); opacity: .83;}
          90% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.17}px); opacity: .83;}
          100% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.00}px); opacity: .83;},
        }`,
        `@keyframes float-path7 {
          0% { transform: translate(${gameContainerWidth * 0.2}px, ${gameContainerHeight * 1}px); opacity: .91;}
          10% { transform: translate(${gameContainerWidth * 0.1}px, ${gameContainerHeight * 0.97}px); opacity: .91;}
          20% { transform: translate(${gameContainerWidth * 0.0}px, ${gameContainerHeight * 0.93}px); opacity: .91;}
          30% { transform: translate(${gameContainerWidth * 0.1}px, ${gameContainerHeight * 0.87}px); opacity: .91;}
          40% { transform: translate(${gameContainerWidth * 0.2}px, ${gameContainerHeight * 0.80}px); opacity: .91;}
          50% { transform: translate(${gameContainerWidth * 0.3}px, ${gameContainerHeight * 0.70}px); opacity: .91;}
          60% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.60}px); opacity: .91;}
          70% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.47}px); opacity: .91;}
          80% { transform: translate(${gameContainerWidth * 0.4}px, ${gameContainerHeight * 0.33}px); opacity: .91;}
          90% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.17}px); opacity: .91;}
          100% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.00}px); opacity: .91;},
        }`,
        `@keyframes float-path8 {
          0% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 1}px); opacity: .90;}
          10% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 0.97}px); opacity: .90;}
          20% { transform: translate(${gameContainerWidth * 0.8}px, ${gameContainerHeight * 0.93}px); opacity: .90;}
          30% { transform: translate(${gameContainerWidth * 1 - rightOffset*containerScale}px, ${gameContainerHeight * 0.87}px); opacity: .90;}
          40% { transform: translate(${gameContainerWidth * 0.8}px, ${gameContainerHeight * 0.80}px); opacity: .90;}
          50% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 0.70}px); opacity: .90;}
          60% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.60}px); opacity: .90;}
          70% { transform: translate(${gameContainerWidth * 0.7}px, ${gameContainerHeight * 0.47}px); opacity: .90;}
          80% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.33}px); opacity: .90;}
          90% { transform: translate(${gameContainerWidth * 0.5}px, ${gameContainerHeight * 0.17}px); opacity: .90;}
          100% { transform: translate(${gameContainerWidth * 0.6}px, ${gameContainerHeight * 0.00}px); opacity: .90;},
        }`,
      ];
    };

    const animateFloatContainer = (container, pathIndex, delay) => {
      const gameContainer = gameContainerRef.current;
      const gameContainerWidth = gameContainer.clientWidth;
      const gameContainerHeight = gameContainer.clientHeight;
      const animationPaths = createAnimationPaths(gameContainerWidth, gameContainerHeight);

      const styleSheet = document.styleSheets[0];
      const animationName = `float-path${pathIndex + 1}`;

      if (!Array.from(styleSheet.cssRules).some((rule) => rule.name === animationName)) {
        styleSheet.insertRule(animationPaths[pathIndex], styleSheet.cssRules.length);
      }

      const element = document.getElementById(container.id);
      element.style.animation = `${animationName} 8s linear ${delay}s infinite`;

      setTimeout(() => {
        element.style.visibility = 'visible';
      }, delay * 1000);
    };

    visibleContainers.forEach((container) => {
      const element = document.getElementById(container.id);
      if (!element) {
        const newContainer = document.createElement('div');
        newContainer.className = styles.floatContainer;
        newContainer.id = container.id;
        newContainer.style.backgroundImage = `url(${container.image})`; // Set background image
        newContainer.style.backgroundSize = 'cover';
        newContainer.style.backgroundPosition = 'center';

        Object.assign(newContainer.style, getContainerStyle(containerScale));
        
        const textElement = document.createElement('div');
        textElement.innerText = container.text;
        textElement.className = styles.text;

        newContainer.appendChild(textElement);
        gameContainerRef.current.appendChild(newContainer);

        const randomPathIndex = Math.floor(Math.random() * 8);
        animateFloatContainer(newContainer, randomPathIndex, container.delay);

        newContainer.addEventListener('click', () =>
          handleContainerClick(container.id, container.text)
        );
		  
        newContainer.addEventListener('click', () =>
          handleContainerClick(container.id, currentQuestion.question, container.text)
        );		  
      }
    });

    const handleResize = () => {
      const floatContainers = document.getElementsByClassName(styles.floatContainer);
      Array.from(floatContainers).forEach((container, index) => {
        container.style.animation = '';
        const randomPathIndex = Math.floor(Math.random() * 8);
        animateFloatContainer(container, randomPathIndex, index * 2);
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [visibleContainers, currentQuestion.question]);

  const handleAnswerClick = (question, answer) => {
    setSelectedCount((prevCount) => {
      const newCount = prevCount + 1;
      setSelectedAnswers((prevAnswers) => {
//        const newAnswers = [...prevAnswers, answer];
//        const formattedAnswers = Object.entries(newAnswers).map(([question, answers]) => ({
//          question,
//          answers
//        }));

        const newAnswers = {
          ...prevAnswers,
          [question]: [...(prevAnswers[question] || []), answer]
        };

        const formattedAnswers = Object.entries(newAnswers).map(([question, answers]) => ({
          question,
          answers
        }));

        onAnswerSelected(formattedAnswers);// Notify parent component with current answers

        if (newCount === required_responses) {
//          console.log(`Question: ${question}`);
//          console.log(`User Answers: ${newAnswers.join(', ')}`);

          if (currentQuestionIndex + 1 < questionsList.length) {
            setSelectedCount(0);
            setSelectedAnswers([]);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          } else {
			removeAllContainers();
            alert(thank_you_message);
          }
        }

        return newAnswers;
      });

      return newCount;
    });
  };

  const handleContainerClick = (id, question, answer) => {
    console.log(`Container clicked: ${id}: ${question}: ${answer}`);
    const element = document.getElementById(id);
    if (element) {
		// Get current position of the element
		const rect = element.getBoundingClientRect();
		const top = rect.top;
		const left = rect.left;		
		
		// Force reflow
		const forceReflow = () => element.offsetHeight;
		forceReflow();

		// Set element position to fixed to keep it in place during the new animation
		element.style.position = 'fixed';
		element.style.top = `${top}px`;
		element.style.left = `${left}px`;
		element.style.width = `${rect.width}px`;
		element.style.height = `${rect.height}px`;
		element.style.zIndex = '1000'; // Bring the element to the front during the rotation effect

		// Apply the new animation
		element.style.animation = 'burst 0.5s forwards';

		setTimeout(() => {
		  element.style.visibility = 'hidden';
		  element.style.animation = ''; // Reset animation
		  element.style.position = 'absolute'; // Reset position
		}, 250); // Remove after rotation animation completes
	  }

    setVisibleContainers((prev) => {
      const updatedContainers = prev.filter((container) => container.id !== id);
      handleAnswerClick(question, answer);

      setSelectedCount((prevCount) => {
        const nextAnswerIndex = prevCount + updatedContainers.length;
//        console.log(`Next Answer Index: ${nextAnswerIndex}`, 'answers.length', answers.length, 'updatedContainers', updatedContainers, 'selectedCount', prevCount);

        if (nextAnswerIndex < answers.length) {
          const newContainer = {
            id: `${instanceId}_floatContainer${nextAnswerIndex + 1}`,
            text: answers[nextAnswerIndex],
            key: `${instanceId}_floatContainer${nextAnswerIndex + 1}`,
            delay: (nextAnswerIndex % numberOfContainers) * 2 + Math.random(), // Random delay between 0 and 1 second
            image: getRandomImage() // Assign a random image from the balloonImages list
          };
          setVisibleContainers((prev) => [...prev, newContainer]);
        }

        return prevCount;
      });

      return updatedContainers;
    });
  };

  const getContainerStyle = (scale) => {
    const baseWidth = 100;
    const baseHeight = 207;
    return {
      width: `${baseWidth * scale}px`,
      height: `${baseHeight * scale}px`,
    };
  };

  return (
    <div className={styles.wrapper} style={{ height: wrapperHeight }}>
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
      <div className={styles.gameContainer} id={`${instanceId}_gameContainer`} ref={gameContainerRef}></div>
    </div>
  );
};

export default FloatingQuestionGame;
