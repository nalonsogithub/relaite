import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import { defaultListingJson, defaultListingDetails } from './DefaultData'; // Import default data
 
// Create the context 
export const ListingDetailsContext = createContext();

// Define the baseUrl for different environments
const baseUrl = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    return 'http://localhost:5000/api';
  } else if (hostname === 'www.aigentTechnologies.com') {
    return 'https://www.aigentTechnologies.com/api';
  } else if (hostname === 'www.openhouseaigent.com') {
    return 'https://www.openhouseaigent.com/api';
  } else {
    return 'https://hbb-zzz.azurewebsites.net/api'; // Default URL if no match
  }
})();

// ListingDetailsProvider component that provides listing details to its children
export const ListingDetailsProvider = ({ children }) => {
  const [listingJson, setListingJson] = useState(null);
  const [listingDetails, setListingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch listing details from the backend
  useEffect(() => {
    const fetchListingDetails = async () => {
      setLoading(true); // Start loading
      try {
        // Fetch listing details
        const response = await axios.get(`${baseUrl}/listing-details`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Include credentials for session variables
        });

        // Parse the response data
        setListingJson(response.data.listing || defaultListingJson);
        setListingDetails(response.data.details || defaultListingDetails);
      } catch (err) {
        console.error('Error fetching listing details:', err.message);
        setError(err.message);

        // Use defaults as fallback
        setListingJson(defaultListingJson);
        setListingDetails(defaultListingDetails);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    // Fetch data on mount
    fetchListingDetails();
  }, []);

  return (
    <ListingDetailsContext.Provider value={{ listingJson, listingDetails, loading, error }}>
      {children}
    </ListingDetailsContext.Provider>
  );
};
