import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteAuth } from '../../contexts/SiteAuthContext';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import styles from '../../styles/ListingAdmin/ListingAdmin.module.css';

const ListingAdmin = () => {
  const { defaultListingId, setDefaultListingId, listingOptions } = useContext(ListingAdminContext);
  const [selectedListing, setSelectedListing] = useState(defaultListingId || ''); // Initialize with defaultListingId
  const { siteLogin, siteSignup, siteLogout, siteIsLoggedIn, siteUser } = useSiteAuth();
	
  const navigate = useNavigate();

  // Set the default value to the first option on initial render if no default listing ID is provided
  useEffect(() => {
    if (!defaultListingId && Object.values(listingOptions).length > 0) {
      const firstListingId = Object.values(listingOptions)[0];
      setSelectedListing(firstListingId);
      setDefaultListingId(firstListingId);
    }
  }, [defaultListingId, listingOptions, setDefaultListingId]);

  // Handle dropdown change without navigating
  const handleListingChange = (event) => {
    const selectedId = event.target.value;
    setSelectedListing(selectedId);
    setDefaultListingId(selectedId);
  };

  // Navigate only when button is clicked
  const handleNavigate = () => {
    navigate('/ListingAdminMainPage'); // Navigate when button is clicked
  };
	
  const handleLogout = async () => {
	console.log('LOGOUT CALLED');
    await siteLogout();
	navigate('/generalentry');
//    setSiteLoginStatus('You have successfully logged out.');
  };	

  return (
    <div className={styles['admin-container']}>
      <div className={styles['instruction-card']}>
        <h2>Welcome to the Listing Admin Page</h2>
        <p>Select a listing to edit from the dropdown below:</p>
        <div className={styles['dropdown-container']}>
          {/* Dropdown using listingOptions from context */}
          <select
            className={styles['listing-dropdown']}
            value={selectedListing}
            onChange={handleListingChange}
          >
            {Object.entries(listingOptions).map(([name, id]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <button className={styles['navigate-button']} onClick={handleNavigate}>
          Go to Admin Page
        </button>
        <button onClick={handleLogout} className={styles['navigate-button']}>
           Log Out
        </button>

      </div>
    </div>
  );
};

export default ListingAdmin;
