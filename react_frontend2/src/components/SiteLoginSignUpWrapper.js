import React from 'react';
import SiteLoginSignUp from './SiteLoginSignUp';
import { useNavigate } from 'react-router-dom';

const SiteLoginSignUpWrapper = () => {
  const navigate = useNavigate();

  // Handle navigation based on the callback
  const handleNav = (route) => {
    switch (route) {
      case 'LandingPage':
        navigate('/LandingPage');
        break;
      case 'admin':
        navigate('/admin-console');
        break;
      default:
        navigate('/');
    }
  };

  return <SiteLoginSignUp onNavButtonClick={handleNav} navButtonName="Go Back" />;
};

export default SiteLoginSignUpWrapper;
