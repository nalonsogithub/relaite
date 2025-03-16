import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CorporateBanner.module.css";

const CorporateBanner = ({ 
  title, 
  url, 
  marqueeText, 
  leftBoxText, 
  leftBoxDestination, 
  leftBoxImage 
}) => {
  const navigate = useNavigate();
  const [currentMarquee, setCurrentMarquee] = useState("");

  useEffect(() => {
    if (marqueeText) {
      setCurrentMarquee(marqueeText);
      const timer = setTimeout(() => {
        setCurrentMarquee(""); // Clear the marquee text after 5 seconds
      }, 5000);
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [marqueeText]);

  const handleLeftBoxClick = () => {
    if (leftBoxDestination) {
      navigate(leftBoxDestination);
    }
  };

  return (
    <div className={styles.bannerContainer}>
      {/* Banner Header */}
      <div className={styles.banner}>
        {/* Left Icon Box */}
        <div 
          className={styles.leftIconContainer} 
          onClick={leftBoxDestination ? handleLeftBoxClick : undefined}
          style={{ cursor: leftBoxDestination ? "pointer" : "default" }}
        >
          {leftBoxImage ? (
            <img 
              src={leftBoxImage} 
              alt="Left Box" 
              className={styles.leftBoxImage}
            />
          ) : (
            <span className={styles.leftBoxText}>{leftBoxText}</span>
          )}
        </div>

        {/* Title and Marquee */}
        <div className={styles.titleContainer}>
          {/* Title */}
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.titleLink}
            >
              {title}
            </a>
          ) : (
            <span className={styles.titleText}>{title}</span>
          )}

          {/* Marquee */}
          <div className={styles.marqueeContainer}>
            {currentMarquee && <span className={styles.marqueeText}>{currentMarquee}</span>}
          </div>
        </div>

        {/* Right Icon Box */}
        <div className={styles.rightIconContainer}>
          <img
            src="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/oha_BLUE.png"
            alt="OHA Logo"
            className={styles.icon}
          />
        </div>
      </div>
    </div>
  );
};

export default CorporateBanner;
