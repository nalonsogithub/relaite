import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AdminConsole.module.css';
import { useSiteAuth } from '../contexts/SiteAuthContext'; 
import { ListingAdminContext } from '../contexts/ListingAdminContext';

const AdminConsole = () => {
  const { siteLogout, siteUser } = useSiteAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [requestedListingId, setRequestedListingId] = useState(null);
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
  } = useContext(ListingAdminContext);

  const [selectedListingId, setSelectedListingId] = useState(null);
  
  // Fetch listings when the component mounts
  useEffect(() => {
    fetchUserListings();
  }, []);
  
  const handleCreateListing = () => {
    navigate('/ListingAdmin');
  };

  const handleManageListing = async (listingId) => {
    setIsLoading(true);
    setRequestedListingId(listingId);
    try {
      await loadSiteJsonFromBackend(listingId);
    } catch (error) {
      console.error('Error loading the listing JSON:', error);
      setIsLoading(false);
    }
  };

  // After JSON is loaded, navigate to listing management
  useEffect(() => {
    if (requestedListingId && listingJson?.listing?.listing_id === requestedListingId) {
      setIsLoading(false);
      navigate('/ListingAdminMainPage');
    }
  }, [listingJson, requestedListingId, navigate]);

  const handleGenerateQRCode = async (listingId) => {
    try {
      setDefaultListingId(listingId);
      await loadSiteJsonFromBackend(listingId);
      await generateQRCode(listingId);
      navigate('/ShowListingIDEntry');
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleSiteLogOut = () => {
    siteLogout();
    navigate('/LandingPage');
  };

  // Group listings by master_listing_id and prepare dropdowns
  const groupedAdminListings = adminListings.reduce((acc, listing) => {
    const masterId = listing.master_listing_id || 'None'; // Group by master_listing_id, use 'None' if null
    if (!acc[masterId]) {
      acc[masterId] = { active: null, listings: [] };
    }
    if (listing.active) {
      acc[masterId].active = listing; // Set active listing
    } else {
      acc[masterId].listings.push(listing); // Push other listings
    }
    return acc;
  }, {});

  // Handle selecting from dropdown
  const handleListingChange = (masterId, event) => {
    const newListingId = event.target.value;
    setSelectedListingId(newListingId);
    if (newListingId) {
      setDefaultListingId(newListingId); // Set new default listing_id
    }
  };

  return (
    <div className={styles.adminConsoleContainer}>
      <div className={styles.topSection}>
        <h2>Welcome, {siteUser?.first_name || 'User'}!</h2>
        <button onClick={handleSiteLogOut} className={styles.logoutButton}>
          Log Out
        </button>
      </div>

      {/* View Listings */}
      <div className={styles.listingsSection}>
        <h2>View Listings</h2>
        <div className={styles.listingsContainer}>
          {viewListings.map((listing) => (
            <div key={listing.listing_id} className={styles.listingItem}>
              <p>{listing.listing_description || 'No description provided'}</p>
              <p><strong>Address:</strong> {listing.listing_address || 'No address provided'}</p>
              <p><strong>ListingID:</strong> {listing.listing_id}</p>
              <button
                className={styles.viewButton}
                onClick={() => window.open(`https://www.openhouseaigent.com?listing_id=${listing.listing_id}`, '_blank')}
              >
                View Listing
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Listings */}
      <div className={styles.listingsSection}>
        <h2>Admin Listings</h2>
        {Object.keys(groupedAdminListings).map((masterId) => {
          const { active, listings } = groupedAdminListings[masterId];
          return (
            <div key={masterId} className={styles.masterListingContainer}>
              <h3>{masterId === 'None' ? 'No Master Listing' : `Master Listing ID: ${masterId}`}</h3>
              <div className={styles.listingItem}>
                <p>{active ? active.listing_description : 'No active listing'}</p>
                <p><strong>Address:</strong> {active?.listing_address || 'No address provided'}</p>
                <p><strong>Active Listing ID:</strong> {active?.listing_id || 'No ID'}</p>
                <button
                  className={styles.manageButton}
                  onClick={() => handleManageListing(active?.listing_id)}
                  disabled={!active}
                >
                  Manage Active Listing
                </button>
                <button
                  className={styles.generateQRButton}
                  onClick={() => handleGenerateQRCode(active?.listing_id)}
                  disabled={!active}
                >
                  Generate QR Code
                </button>

                {/* Dropdown for other listings associated with master_listing_id */}
                {listings.length > 0 && (
                  <div className={styles.versionDropdownContainer}>
                    <label>Other Listings:</label>
                    <select
                      value={selectedListingId || active?.listing_id}
                      onChange={(e) => handleListingChange(masterId, e)}
                      className={styles.versionDropdown}
                    >
                      <option value={active?.listing_id}>Active Listing</option>
                      {listings.map((listing) => (
                        <option key={listing.listing_id} value={listing.listing_id}>
                          {`Listing ${listing.listing_id} (Created at: ${listing.created_at})`}
                        </option>
                      ))}
                    </select>
                    {selectedListingId && selectedListingId !== active?.listing_id && (
                      <button
                        className={styles.manageButton}
                        onClick={() => handleManageListing(selectedListingId)}
                      >
                        Manage Selected Listing
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.createListingContainer}>
        <button className={styles.createListingButton} onClick={handleCreateListing}>
          Create Listing
        </button>
      </div>
    </div>
  );
};

export default AdminConsole;
