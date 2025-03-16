import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import { useSiteAuth } from '../../contexts/SiteAuthContext';
import styles from '../../styles/ListingAdmin/ListingAdminMainPage.module.css';

const ListingAdminMainPage = () => {
  const { setSelectedSection, listingJson, jsonChanged, setJsonChanged } = useContext(ListingAdminContext);
  const { siteLogout, siteUser } = useSiteAuth(); // Use siteLogout from the context
  const navigate = useNavigate();

  const navigateToSection = (section) => {
    setSelectedSection(section);
    navigate(`/${section}`);
  };

  const handleSiteLogOut = () => {
	siteLogout();
    navigate('/LandingPage');
	  
  };
	
	
  return (
    <div className={styles['main-page-container']}>
      <div className={styles['admin-card']}>
        <h2 className={styles['page-title']}>Listing Admin - Main Page</h2>
        <p className={styles['page-description']}>Select a section to edit:</p>
        
        <div className={styles['button-group']}>
          <button
            className={`${styles['section-button']} ${styles['fixed-button']}`}
            onClick={() => navigateToSection('ListingAdminAssistant')}
          >
            OpenAI Assistant
          </button>
		{/*
          <button
            className={`${styles['section-button']} ${styles['fixed-button']}`}
            onClick={() => navigateToSection('ListingAdminConfirmListing')}
            disabled={!jsonChanged} 
            style={{
              backgroundColor: jsonChanged ? '#4a6fa5' : '#aaa',
              cursor: jsonChanged ? 'pointer' : 'not-allowed',
            }}
          >
            Confirm Listing Creation
          </button>
        </div>
		*/}
          <button
            className={`${styles['section-button']} ${styles['fixed-button']}`}
            onClick={() => navigateToSection('ListingAdminConfirmListing')}
          >
            Confirm Listing Creation
          </button>
        </div>
        
        <div className={styles['button-group']}>
          <button className={`${styles['section-button']} ${styles['fixed-button']}`} onClick={() => navigateToSection('ListingAdminListing')}>
            Listing Details
          </button>
          <button className={`${styles['section-button']} ${styles['fixed-button']}`} onClick={() => navigateToSection('ListingAdminAgent')}>
            Agent Details
          </button>
        </div>
        
        <div className={styles['button-group']}>
          <button className={`${styles['section-button']} ${styles['fixed-button']}`} onClick={() => navigateToSection('ListingAdminCarousel')}>
            Carousel
          </button>
          <button className={`${styles['section-button']} ${styles['fixed-button']}`} onClick={() => navigateToSection('ListingAdminBinGame')}>
            Home Images
          </button>
        </div>
        
        <div className={styles['button-group']}>
          <button className={`${styles['section-button']} ${styles['fixed-button']}`} onClick={() => navigateToSection('ListingAdminImageBubbleGame')}>
            First Impressions
          </button>
          <button className={`${styles['section-button']} ${styles['fixed-button']}`} onClick={() => navigateToSection('ListingAdminQuestions')}>
            Questions
          </button>
        </div>
        <div className={styles['button-group']}>
          <button className={`${styles['section-button']} ${styles['fixed-button']}`} onClick={handleSiteLogOut}>
            Logout
          </button>
          <button className={`${styles['section-button']} ${styles['fixed-button']}`} onClick={() => navigateToSection('admin-console')}>
            Admin Console
          </button>
        </div>

        {/* New Button for Statistics */}
        <div className={styles['button-group']}>
          <button
            className={`${styles['section-button']} ${styles['fixed-button']}`}
            onClick={() => navigateToSection('ListingAdminStatistics')}
          >
            View Statistics
          </button>
        </div>

      </div>
    </div>
  );
};

export default ListingAdminMainPage;
