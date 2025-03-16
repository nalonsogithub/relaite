// LoadingOverlay.js
import React, { useEffect, useState } from 'react';
import '../styles/LoadingOverlay.css'; // Assuming you have a CSS file for styling

const messages = [
  "Gathering your response...",
  "Processing data...",
  "Generating insights...",
  "Almost there..."
];

const LoadingOverlay = () => {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    setCurrentMessage(messages[messageIndex]);
  }, [messageIndex]);

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        {/* You can use any spinner or loading animation here */}
        <div className="spinner"></div>
      </div>
      <div className="loading-message">
        {currentMessage}
      </div>
    </div>
  );
};

export default LoadingOverlay;
