// MainCarouselPage.js
import React, { useState, useEffect } from 'react';
import MainCarousel from './MainCarousel';
import { useLocation } from 'react-router-dom'; // Change from useParams to useLocation

const MainCarouselPage = () => {
  const [components, setComponents] = useState([]);
  const location = useLocation(); // Use useLocation to access the location object

useEffect(() => {
  const loadComponents = async () => {
    const { userType } = location.state || { userType: 'default' }; // Ensure default is always set
    console.log("User type is:", userType); // This will confirm what userType is being used
  };

  loadComponents();
}, [location.state]); // Depend on location.state to reload components when it changes

  return (
    <div>
      <MainCarousel components={components} />
    </div>
  );
};

export default MainCarouselPage;
