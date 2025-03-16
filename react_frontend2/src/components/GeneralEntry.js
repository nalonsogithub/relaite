import React, { useEffect, useState } from 'react';
import { useSiteAuth } from '../contexts/SiteAuthContext';
import { useNavigate } from 'react-router-dom';
import SiteLoginSignUp from './SiteLoginSignUp'; // Import the login/signup component

const GeneralEntry = () => {
  const { siteIsLoggedIn, siteUser } = useSiteAuth(); // Get login status from context
  const [currentView, setCurrentView] = useState('login'); // Default view is login
  const navigate = useNavigate();

  // Detect login status changes
  useEffect(() => {
	console.log('IN GENERAL ENTRY, siteIsLoggedIn', siteIsLoggedIn);
    if (siteIsLoggedIn) {
      setCurrentView('adminConsole'); // Switch to admin console view on login
    }
  }, [siteIsLoggedIn]);

  // Navigate to the AdminConsole component
  useEffect(() => {
    if (currentView === 'adminConsole') {
      navigate('/admin-console'); // Navigate to the admin console route
    }
  }, [currentView, navigate]);

  return (
    <div>
      {currentView === 'login' ? (
        <SiteLoginSignUp currentView="login" /> // Show the login view
      ) : null}
    </div>
  );
};

export default GeneralEntry;
