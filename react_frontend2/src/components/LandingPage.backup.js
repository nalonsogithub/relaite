import React, { useEffect, useState, useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteAuth } from '../contexts/SiteAuthContext';
import { ListingAdminContext } from '../contexts/ListingAdminContext';

const LandingPage = () => {
  const {
    siteIsLoggedIn,
    siteListingIdFound,
    idFromURL,
    fetchListingId,
    siteLogout,
	listingId,
	syncStateWithBackend
  } = useSiteAuth();
  const navigate = useNavigate();

  // Step 1: Create local states to track fetched values
  const [sessionData, setSessionData] = useState({
    siteIsLoggedIn: false,
    siteListingIdFound: false,
    idFromURL: false,
  });
	
  const { listingJson, imageURL, loadSiteJsonFromBackend } = useContext(ListingAdminContext); // Access context
  const [loading, setLoading] = useState(true); // State to track loading status


  useEffect(() => {
	console.log('IN LANDING PAGE');
		const currentPath = window.location.pathname;
//		console.log('CURRENT PATH', currentPath);

    const initializePage = async () => {
      	// Step 2: Fetch the latest listing ID from session and use the returned values directly
      	const { listingId, siteListingIdFound, idFromURL } = await fetchListingId();
      	console.log('[DEBUG] listingId, siteListingIdFound, idFromURL', listingId, siteListingIdFound, idFromURL);
		// Sync with the backend to ensure session is valid
		await syncStateWithBackend();
		
		// Get current path and query parameters
		const isListingsPath = currentPath.includes('/listings');
		
      	// Step 3: Use returned values to update local session data state
      	setSessionData({ siteIsLoggedIn, siteListingIdFound, idFromURL });

		
      if (listingId) {
        await loadSiteJsonFromBackend(listingId); // Load listing JSON from backend
      }		
		
		
		
      // Step 5: Check navigation conditions based on fetched values
      if (isListingsPath && siteListingIdFound && idFromURL) {
        console.log('LISTING_ID FOUND: Navigating to WELCOME PAGE...');
        navigate('/WelcomePage');
      } else if (!siteIsLoggedIn) {
        console.log('NO LID: NOT LOGGED IN: Navigating to SiteLoginSignUp...');
        await siteLogout(); // Call the logout function
        navigate('/SiteLoginSignUpWrapper');
      } else if (siteIsLoggedIn) {
        console.log('NO LID: LOGGED IN: Navigating to Admin-Console...');
        navigate('/AdminConsole');
      } else {
        navigate('/MainHomePage');
      }
    };

    initializePage();
//  }, [siteIsLoggedIn, fetchListingId, navigate, siteLogout]);
  }, [
	  siteIsLoggedIn,
      syncStateWithBackend,
      siteListingIdFound,
      idFromURL,
      fetchListingId,
      loadSiteJsonFromBackend,
      siteLogout,
      navigate,
     ]);
  // Step 5: Display values in the component
  return <div>Loading...</div>;
};

export default LandingPage;
