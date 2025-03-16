import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AdminConsole.module.css';
import { useSiteAuth } from '../contexts/SiteAuthContext'; 
import { ListingAdminContext } from '../contexts/ListingAdminContext';

const AdminConsole = () => {
	// Handle Login From Site Auth Context 	
	const {siteUser,
		   siteIsLoggedIn,
		   siteIsAdmin,
		   siteLogin,
		   siteSignup,
		   siteLogout,
		   siteLoading,
		   userJson} = useSiteAuth([])
	
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
		updateUserAdminRights,
	} = useContext(ListingAdminContext);
	
	const [selectedListingId, setSelectedListingId] = useState(null);
  
	  // Fetch listings when the component mounts
	  useEffect(() => {
		const fetchData = async () => {
		  setIsLoading(true); // Start loading
		  await fetchUserListings(); // Wait for data to load
		  setIsLoading(false); // End loading
		};

		fetchData();
	  }, []);
useEffect(() => {
    console.log("User Info:", {
        siteUser,
        siteIsLoggedIn,
        siteIsAdmin,
        userJson
    });
}, [siteUser, siteIsLoggedIn, siteIsAdmin, userJson]);
	
	// Sorting view listings by created_at in descending order (most recent first)
	const sortedViewListings = [...viewListings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	
	const handleCreateListing = () => {
		navigate('/ListingAdmin');
	};

	const handleManageListing = async (listingId) => {
	  if (!listingId) return;

	  setIsLoading(true);

	  try {
		console.log('Loading Json');
		await loadSiteJsonFromBackend(listingId); // Load the JSON data for the listing
		setIsLoading(false); // Stop loading state after success
		navigate('/ListingAdminMainPage'); // Navigate directly
	  } catch (error) {
		console.error('Error loading the listing JSON:', error);
		setIsLoading(false); // Stop loading state on error
	  }
	};

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
	
	const handleUpdateAdminRights = async () => {
		try {
		  await updateUserAdminRights(); // Call the context function
		  alert("Admin rights updated successfully!"); // Notify the user
		} catch (error) {
		  console.error("Error updating admin rights:", error);
		  alert("Failed to update admin rights. Please try again.");
		}
	};	
	
	  if (isLoading) {
		return (
		  <div className={styles.loadingScreen}>
			<p>Loading...</p>
		  </div>
		);
	  }
	
	
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
					{sortedViewListings.map((listing) => (
						<div key={listing.master_listing_id} className={styles.listingItem}>
							<p>{listing.listing_description || 'No description provided'}</p>
							<p><strong>Address:</strong> {listing.listing_address || 'No address provided'}</p>
							<p><strong>ListingID:</strong> {listing.master_listing_id.toLowerCase()}</p>
							<button
							  className={styles.viewButton}
							  onClick={() => {
								const listingId = listing.master_listing_id.toLowerCase(); // Ensure listing_id is lowercase
								window.open(`https://www.openhouseaigent.com/listings?listing_id=${listingId}`, '_blank');
							  }}
							>
							  View Listing
							</button>		
						</div>
					))}
				</div>
			</div>

		  {/* Admin Listings and Create Listing Section */}
		  {siteIsAdmin && (
			  <>
			{/* Admin Listings */}
			<div className={styles.listingsSection}>
			  <h2>Admin Listings</h2>
			  {Object.entries(groupedAdminListings)
				.sort(([, a], [, b]) => new Date(b.active.created_at) - new Date(a.active.created_at))
				.map(([masterId, { active, listings }]) => {
				  const sortedAdminListings = listings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
				  return (
					<div key={masterId} className={styles.listingsContainer}>
					  <div className={styles.listingItem}>
						<p>{active ? active.listing_description : 'No active listing'}</p>
						{/* Add Master Listing ID display */}
						<p><strong>Master Listing ID:</strong> {active?.master_listing_id || 'None'}</p>	  
						<p><strong>Address:</strong> {active?.listing_address || 'No address provided'}</p>
						<p><strong>Active Listing ID:</strong> {active?.listing_id ? active.listing_id.toLowerCase() : 'No ID'}</p>
						{/* Add created_at here */}
						<p><strong>Created At:</strong> {new Date(active?.created_at).toLocaleString()}</p>
						<button
						  className={styles.manageButton}
						  onClick={() => handleManageListing(active?.listing_id)}
						  disabled={!active}
						>					  
						  Manage Active Listing
						</button>
						<button
						  className={styles.manageButton}
						  onClick={() => handleGenerateQRCode(active?.listing_id?.toLowerCase())}
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
							  <option value={active?.listing_id}>{`Active Listing (${active?.listing_id?.toLowerCase()})`}</option>
							  {sortedAdminListings.map((listing) => (
								<option key={listing.listing_id} value={listing.listing_id.toLowerCase()}>
								  {`(Created at: ${new Date(listing.created_at).toLocaleString()}) Listing ${listing.listing_id.toLowerCase()}`}
								</option>
							  ))}
							</select>
							{selectedListingId && selectedListingId !== active?.listing_id && (
							  <button
								className={styles.manageButton}
								onClick={() => {
								  const lowerCaseListingId = selectedListingId.toLowerCase();
								  window.open(`/listings?listing_id=${lowerCaseListingId}`, '_blank');
								}}
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
			{/* Admin Listings END */}

			  </>
		  )}
		</div>
	);
};

export default AdminConsole;
