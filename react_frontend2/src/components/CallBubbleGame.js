import React from 'react';
import RenderImageBubbleGame from './RenderImageBubbleGame';
import styles from '../styles/CallBubbleGame.module.css';

const CallBubbleGame = () => {
  return (
    <div className={styles.cbg_mainContainer}>
      {/* Placeholder for Header */}
      <header className={styles.cbg_header}>
        <h1>Welcome to Our Interactive Experience</h1>
        <p>Discover the features and share your thoughts.</p>
      </header>

      {/* Placeholder for Navigation or Introduction Section */}
      <section className={styles.cbg_introSection}>
        <p>This section could contain introductory text or navigation links.</p>
      </section>

      {/* RenderImageBubbleGame Component */}
      <section className={styles.cbg_gameSection}>
        <RenderImageBubbleGame />
      </section>

      {/* Placeholder for Additional Content Below the Game */}
      <section className={styles.cbg_footer}>
        <p>Thank you for participating! Check out other features below.</p>
        {/* Placeholder for additional components or links */}
      </section>
    </div>
  );
};

export default CallBubbleGame;
