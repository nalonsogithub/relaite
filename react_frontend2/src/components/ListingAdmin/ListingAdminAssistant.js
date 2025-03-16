import React, { useContext, useState } from 'react';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import styles from '../../styles/ListingAdmin/ListingAdminListing.module.css'; // Reuse the same CSS styles
import { useNavigate } from 'react-router-dom';

const ListingAdminAssistant = () => {
  const { listingJson, setListingJson } = useContext(ListingAdminContext); // Access context
  const [assistantDetails, setAssistantDetails] = useState(listingJson.assistant); // Set initial state for assistant details
  const navigate = useNavigate();

  // Handle form changes for assistant details
  const handleChange = (event) => {
    const { name, value } = event.target;
    setAssistantDetails({ ...assistantDetails, [name]: value });
  };

  // Save changes to context and navigate back
  const handleSave = () => {
    setListingJson((prevState) => ({
      ...prevState,
      assistant: assistantDetails,
    }));
    navigate('/ListingAdminMainPage'); // Navigate back to the main page after saving
  };


	
	
  return (
    <div className={styles['listing-container']}>
      <div className={styles['listing-card']}>
        <h2 className={styles['page-title']}>Edit Assistant Details</h2>
        <form className={styles['form-container']}>
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Assistant ID:</label>
            <input
              type="text"
              name="assistant_id_OAI"
              value={assistantDetails.assistant_id_OAI}
              onChange={handleChange}
              className={styles['form-input']}
            />
          </div>
	  {/*
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Assistant Description:</label>
            <input
              type="text"
              name="assistant_description"
              value={assistantDetails.assistant_description}
              onChange={handleChange}
              className={styles['form-input']}
            />
          </div>
	 */}

          {/* Button Group for Save and Back to Main Navigation */}
          <div className={styles['navButtonContainer']}>
			  <div className=  {styles.navButtonContainer}>
				<button type="button" className={styles['back-button']} onClick={(handleSave)}>
				Back to Main
				</button>		  
			  </div>
	  
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingAdminAssistant;
// JavaScript Document