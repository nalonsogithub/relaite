import React from 'react';
import styles from '../styles/WelcomePageModal.module.css';
import Aigent_2 from './Aigent_2';

const WelcomePageModal = ({ isOpen, onClose, chatLog, collapseCarousel, showFull, isModal = true, showLabels = false }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === styles.modalOverlay) {
      onClose();
    }
  };
	

	

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header section */}
        <div className={styles.headerContainer}>
          <div className={styles.leftLogo}>
            <img src="https://aigentstorage.blob.core.windows.net/aigentstorage/REAL_ESTaiTE/OHAI_logo.png" alt="Logo" className={styles.logo} />
          </div>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>Open House AIgent</h1>
          </div>
          <div className={styles.rightLogo}>
            <img src="https://aigentstorage.blob.core.windows.net/aigentstorage/REAL_ESTaiTE/OHAI_logo.png" alt="Logo" className={styles.logo} />
          </div>
        </div>

        {/* Chatbot content */}
        <div className={styles.ChatBotContainer}>
			<Aigent_2
			  collapseCarousel={collapseCarousel}
			  chatLog={chatLog}
			  showFull={showFull}
			  isModal={isModal}
			  showLabels={showLabels}
			  maxHeight="90%"
			/>
		</div>
      </div>
    </div>
  );
};

export default WelcomePageModal;
