import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteAuth } from '../contexts/SiteAuthContext';
import WelcomePage from './WelcomePage';
import AdminConsole from './AdminConsole';
import SiteLoginSignUp from './SiteLoginSignUp';

const LandingPage = () => {
  const { siteIsLoggedIn, siteIsAdmin, fetchListingId, siteListingIdFound, idFromURL } = useSiteAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = async () => {
      // Check if the user is logged in
      if (!siteIsLoggedIn) {
//        navigate('/SiteLoginSignUp'); 
        return;
      }

      // If the user is logged in, check for the listing ID
      await fetchListingId();

      // Ensure the logic only proceeds if the login state and listing ID state are properly updated
      if (siteIsLoggedIn && !siteListingIdFound) {
		
//        navigate('/admin-console'); 
        return;
      }
    };

    initializePage();
  }, [siteIsLoggedIn, siteListingIdFound, fetchListingId, navigate]);

  // Show a loader or message until the checks are complete
  if (!siteIsLoggedIn) return null;

  // If the user is logged in and listing ID is found, render the WelcomePage component
  return siteListingIdFound ? <WelcomePage /> : <AdminConsole />;
};

export default LandingPage;
