import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styles from '../styles/AdminConsole.module.css'; // Create a CSS module for styling
import { useSiteAuth } from '../contexts/SiteAuthContext'; // Import the authentication context
import { useNavigate } from 'react-router-dom'; 
import { ListingAdminContext } from '../contexts/ListingAdminContext';

const AdminConsole = () => {
  const { siteLogout, siteUser } = useSiteAuth(); // Use siteLogout from the context
  const [isLoading, setIsLoading] = useState(false);
  const [requestedListingId, setRequestedListingId] = useState(null); // Track the requested listing
  const [selectedMasterListingId, setSelectedMasterListingId] = useState(null); // Track the selected master listing
  const navigate = useNavigate();
	
  const {
    loadSiteJsonFromBackend,
    generateQRCode,
    setDefaultListingId,
    setQRCodeUrl,		 
    listingJson, 
    viewListings,
    adminListings,		 
    fetchUserListings,
    defaultListingId,
    versions = {} // Initialize versions as an empty object by default
  } = useContext(ListingAdminContext);
	
  const [selectedVersion, setSelectedVersion] = useState(''); // Store selected version

  // Use effect to fetch listings when the component mounts
  useEffect(() => {
    fetchUserListings(); // Fetch the listings from context
  }, []);	

  // Helper function to get the default listing based on active status
  const getDefaultListing = (listings) => {
    const activeListing = listings.find(listing => listing.active === 1);
    return activeListing ? activeListing.listing_id : ''; // Return empty if no active listing
  };

  // Group listings by `master_listing_id` and order by creation date
  const groupAdminListingsByMasterId = () => {
    const groupedListings = {};
    adminListings.forEach((listing) => {
      const masterId = listing.master_listing_id || 'none'; // Use 'none' for listings without master_listing_id
      if (!groupedListings[masterId]) {
        groupedListings[masterId] = [];
      }
      groupedListings[masterId].push(listing);
    });
    // Sort listings by created_at (newest first)
    Object.keys(groupedListings).forEach((masterId) => {
      groupedListings[masterId].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });
    return groupedListings;
  };

  // Handle listing selection
  const handleListingChange = (listingId) => {
    setRequestedListingId(listingId);
    handleManageListing(listingId);
  };

  // Function to handle listing management
  const handleManageListing = async (listingId) => {
    setIsLoading(true);
    setRequestedListingId(listingId); // Store the listing ID that we're trying to load
    try {
      await loadSiteJsonFromBackend(listingId); // Load the listing JSON from backend
    } catch (error) {
      console.error('Error loading the listing JSON:', error);
      setIsLoading(false);
    }
  };

  // Generate QR code for selected listing
  const handleGenerateQRCode = async (listingId) => {
    try {
      setDefaultListingId(listingId);
      await loadSiteJsonFromBackend(listingId);
      await generateQRCode(listingId);
      navigate('/ShowListingIDEntry');
    } catch (error) {
      console.error('Error generating QR code for listing:', error);
    }
  };

  const groupedAdminListings = groupAdminListingsByMasterId(); // Group the listings for display

  return (
    <div className={styles.adminConsoleContainer}>
      <div className={styles.topSection}>
        <h2>Welcome, {siteUser?.first_name || 'User'}!</h2>
        <button onClick={() => { siteLogout(); navigate('/LandingPage'); }} className={styles.logoutButton}>
          Log Out
        </button>
      </div>

      <div className={styles.listingsSection}>
        <h2>Admin Listings</h2>
        <div className={styles.listingsContainer}>
          {Object.keys(groupedAdminListings).map((masterId) => {
            const listings = groupedAdminListings[masterId];
            const defaultListingId = getDefaultListing(listings); // Get the default active listing for this group
            const isActive = defaultListingId !== '';

            return (
              <div key={masterId} className={styles.masterListingGroup}>
                <h3>{masterId === 'none' ? 'Master Listing: None' : `Master Listing: ${masterId}`}</h3>

                <select
                  value={requestedListingId || defaultListingId}
                  onChange={(e) => handleListingChange(e.target.value)}
                  className={styles.listingDropdown}
                >
                  <option value="">Select a Listing</option>
                  {listings.map((listing) => (
                    <option key={listing.listing_id} value={listing.listing_id}>
                      {listing.listing_description || `Listing ${listing.listing_id}`} (Created: {new Date(listing.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>

                {isActive && (
                  <p><strong>Active Listing: {defaultListingId}</strong></p>
                )}
                
                <button
                  className={styles.manageButton}
                  onClick={() => handleManageListing(requestedListingId || defaultListingId)}
                >
                  Manage Listing
                </button>

                <button
                  className={styles.generateQRCodeButton}
                  onClick={() => handleGenerateQRCode(requestedListingId || defaultListingId)}
                >
                  Generate QR Code
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.createListingContainer}>
        <button className={styles.createListingButton} onClick={() => navigate('/ListingAdmin')}>
          Create Listing
        </button>
      </div>
    </div>
  );
};

export default AdminConsole;
