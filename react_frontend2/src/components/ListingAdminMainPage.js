import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import styles from '../styles/ListingAdminMainPage.module.css'; // Use a separate CSS module

const ListingAdminMainPage = () => {
  const { setSelectedSection } = useContext(ListingAdminContext);
  const navigate = useNavigate();

  const navigateToSection = (section) => {
    setSelectedSection(section);
    navigate(`/${section}`); // Use `navigate` for correct navigation
  };

  return (
    <div className={styles['main-page-container']}>
      <div className={styles['admin-card']}>
        <h2 className={styles['page-title']}>Listing Admin - Main Page</h2>
        <p className={styles['page-description']}>Select a section to edit:</p>
        <div className={styles['button-group']}>
          <button className={styles['section-button']} onClick={() => navigateToSection('ListingAdminListing')}>
            Edit Listing Details
          </button>
          <button className={styles['section-button']} onClick={() => navigateToSection('ListingAdminAgent')}>
            Edit Agent Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingAdminMainPage;
