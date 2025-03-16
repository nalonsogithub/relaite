import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import styles from '../styles/ListingAdmin.module.css';

const ListingAdmin = () => {
  const { setSelectedSection } = useContext(ListingAdminContext);
  const [selectedListing, setSelectedListing] = useState(''); // Store selected value
//  const [selectedVersion, setSelectedVersion] = useState('');
  const navigate = useNavigate();

  // Handle dropdown change without navigating
  const handleListingChange = (event) => {
    setSelectedListing(event.target.value);
  };
	
  // Handle dropdown change for version
//  const handleVersionChange = (event) => {
//    setSelectedVersion(event.target.value);
//  };	
	
  // Function to handle "View JSON" button click
//  const handleViewJson = (jsonId) => {
//    console.log(`View JSON for ${jsonId}`); // Add your logic here
//  };
	
  // Function to handle "Manage Version" button click
//  const handleManageVersion = (jsonId) => {
//    console.log(`Manage version for ${jsonId}`); // Add your logic here
//  };	

  // Navigate only when button is clicked
  const handleNavigate = () => {
    setSelectedSection(selectedListing);
    navigate('/ListingAdminMainPage'); // Navigate when button is clicked
  };

  return (
    <div className={styles['admin-container']}>
      <div className={styles['instruction-card']}>
        <h2>Welcome to the Listing Admin Page</h2>
        <p>Select a listing to edit from the dropdown below:</p>
        <div className={styles['dropdown-container']}>
          <select
            className={styles['listing-dropdown']}
            value={selectedListing}
            onChange={handleListingChange}
          >
            <option value="">Select a Listing</option>
            <option value="listing">Listing Details</option>
            <option value="agent">Agent Details</option>
          </select>
        </div>
        {selectedListing && (
          <button className={styles['navigate-button']} onClick={handleNavigate}>
            Go to Admin Page
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingAdmin;
