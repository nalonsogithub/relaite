import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import ReactJson from 'react-json-view'; // Import react-json-view for displaying JSON
import styles from '../../styles/ListingAdmin/ListingAdminConfirmListing.module.css'; // Import your CSS module

const ListingAdminConfirmListing = () => {
  const { listingJson, handleListingAdminAction  } = useContext(ListingAdminContext); // Use context to get the JSON data
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);


  // Generic function to handle loading, action, and navigation
  const handleActionAndNavigate = async (actionType) => {
    setIsLoading(true); // Set loading state to true
    try {
      await handleListingAdminAction(actionType); // Call the context function with the action type
      setIsLoading(false); // Set loading state to false after completion
      navigate('/ShowListingIDEntry'); // Navigate to the target route after the operation is complete
    } catch (error) {
      console.error("Error handling action:", error);
      setIsLoading(false); // Make sure to stop loading in case of an error
    }
  };	
	
  // Handle button clicks for navigation and actions
  const handleCreateNewListing = () => {
    handleActionAndNavigate('create'); // Call the context function with 'create' action
  };

  const handleEditCurrentListing = () => {
    handleActionAndNavigate('edit'); // Call the context function with 'edit' action
  };
	
  // Save Changes and upload the images
  const handleBack = () => {
    navigate('/ListingAdminMainPage');
  };
	
  return (
    <div
      className={styles['confirm-listing-container']}
      style={{ pointerEvents: isLoading ? 'none' : 'auto' }} // Conditionally apply styles based on `isLoading`
    >
      {isLoading && (
        <div className={styles['loading-overlay']}>
          <div className={styles['loading-modal']}>
            <div className={styles['spinner']}></div>
            <div className={styles['scrolling-text']}>
              <p>Listing is being updated. Images are being uploaded to the blob storage...</p>
              <p>Listing tables in the database are being updated...</p>
              <p>Hold on, almost done...</p>
            </div>
          </div>
        </div>
      )}
      <h2 className={styles['page-title']}>Confirm Listing</h2>
	  
      
      {/* Button Group */}
      <div className={styles['button-group']}>
        <button className={`${styles['action-button']}`} onClick={handleCreateNewListing}>
          Create New Listing
        </button>
        <button className={`${styles['action-button']}`} onClick={handleEditCurrentListing}>
          Edit Current Listing
        </button>
      </div>

      {/* JSON Viewer */}
      <div className={styles['json-container']}>
        <h3 className={styles['json-title']}>Current Listing JSON</h3>
        <ReactJson
          src={listingJson}
          collapsed={true} // Collapse all nodes by default
          enableClipboard={true} // Allow copying of JSON nodes
          displayDataTypes={false} // Hide data types
          theme="monokai" // Set the theme (you can customize this)
          style={{ backgroundColor: '#282c34', padding: '20px', borderRadius: '8px' }} // Apply custom styling
        />
      </div>

	  <div className=  {styles.navButtonContainer}>
        <button type="button" className={styles['back-button']} onClick={(handleBack)}>
          Back to Main
        </button>		  
	  </div>

    </div>
  );
};

export default ListingAdminConfirmListing;
// JavaScript Document