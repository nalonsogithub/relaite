	import React, { createContext, useState, useContext, useEffect } from 'react';
	import axios from 'axios';
	import { useNavigate } from 'react-router-dom';
	import _ from 'lodash';

	const SiteAuthContext = createContext();

	export const useSiteAuth = () => useContext(SiteAuthContext);

	export const SiteAuthProvider = ({ children }) => {
	  const [siteUser, setSiteUser] = useState(null); // Store user information globally
	  const [siteIsLoggedIn, setSiteIsLoggedIn] = useState(false);
	  const [siteIsAdmin, setSiteIsAdmin] = useState(false);
	  const [siteLoading, setSiteLoading] = useState(true);
	  const [listingId, setListingId] = useState(null); // Changed `userState` to `useState`
	  const [siteListingIdFound, setSiteListingIdFound] = useState(false); // New variable to track listing ID presence
	  const [idFromURL, setIdFromURL] = useState(false); // New variable to track listing ID presence
	  const navigate = useNavigate();

	  // Define the base URL based on the current environment
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

	  useEffect(() => {
		// Check local storage or session for user data on initial load
		const savedUser = localStorage.getItem('siteUser');
		const savedAdmin = localStorage.getItem('siteIsAdmin') === 'true'; // Retrieve admin status

		if (savedUser) {
		  setSiteUser(JSON.parse(savedUser));
		  setSiteIsLoggedIn(true);
		  setSiteIsAdmin(savedAdmin); // Set admin status from local storage
		}
		setSiteLoading(false);
	  }, []);

	  // Load session state from backend
	  const syncStateWithBackend = async () => {
		try {
		  const response = await axios.get(`${baseUrl}/check-login`, { withCredentials: true });
		  if (response.status === 200) {
			const data = response.data;
			setSiteIsLoggedIn(data.isLoggedIn);
			setSiteIsAdmin(data.isAdmin);
			setSiteUser(data.user);
		  } else {
			resetState();
		  }
		} catch (error) {
		  console.error('Failed to sync state with backend:', error);
		  resetState();
		}
	  };	


	  const siteLogin = async (email, password) => {
		try {
		  const response = await axios.post('/api/sitelogin', { email, password });
		  const userData = response.data;

		  setSiteUser(userData);
		  setSiteIsLoggedIn(true);
		  setSiteIsAdmin(userData.admin); // Save admin status


		  localStorage.setItem('siteUser', JSON.stringify(userData)); // Persist user state
		  navigate('/placeholder'); // Navigate to the placeholder page on success
		  return { success: true };
		} catch (error) {
		  return { success: false, message: error.response?.data?.message || 'Login failed' };
		}
	  };

	  // Function to fetch the listing ID from the session using the baseUrl
//	  const fetchListingId = async () => {
//		try {
//		  const response = await axios.get(`${baseUrl}/get_listing_id`);
//		  const sessionListingId = response.data.listing_id || ""; // Get listing_id from response or empty string if not found
//		  const isIDFromURL = response.data.id_from_url === true;  // Ensure it's a boolean
//
//
//		  // Update the listingId state only if it's different to avoid unnecessary updates
//		  if (!_.isEqual(sessionListingId, listingId)) {
//			setListingId(sessionListingId);
//			setIdFromURL(isIDFromURL);
//		  }
//
//		  // Determine if a listing ID was found
//		  const found = sessionListingId !== "";
//		  setSiteListingIdFound(found); // Set the new state variable
//		  return { listingId: sessionListingId, siteListingIdFound: found, idFromURL: isIDFromURL }; // Return both variables
//		} catch (error) {
//		  console.error('Error fetching listing ID from session:', error);
//		  return { listingId: "", siteListingIdFound: false, idFromURL: false }; // Return default values on error
//		}
//	  };

        const fetchListingId = async () => {
          try {
            const response = await axios.get(`${baseUrl}/get_listing_id`);
            const sessionListingId = response.data.listing_id || "";
            const isIDFromURL = response.data.id_from_url === true;

            setListingId(sessionListingId);
            setIdFromURL(isIDFromURL);
            setSiteListingIdFound(!!sessionListingId);

            return { listingId: sessionListingId, siteListingIdFound: !!sessionListingId, idFromURL: isIDFromURL };
          } catch (error) {
            console.error("Error fetching listing ID from session:", error);
            return { listingId: "", siteListingIdFound: false, idFromURL: false };
          }
        };



	  const siteSignup = async (userDetails) => {
		try {
		  const response = await axios.post('/api/sitesignup', userDetails);
		  const userData = response.data;

		  setSiteUser(userData);
		  setSiteIsLoggedIn(true);
		  setSiteIsAdmin(false); // New users won't be admins initially

		  localStorage.setItem('siteUser', JSON.stringify(userData)); // Persist user state
		  localStorage.setItem('siteIsAdmin', 'false'); // Store admin status as false
		  return { success: true, user: userData, isAdmin: false };
		} catch (error) {
		  return { success: false, message: error.response?.data?.message || 'Signup failed' };
		}
	};

	  // Reset state on logout or error
	  const resetState = () => {
		setSiteIsLoggedIn(false);
		setSiteIsAdmin(false);
		setSiteUser(null);
		setIdFromURL(false);
		setListingId(null);
		localStorage.clear();
		navigate('/MainPage');
	  };

		const siteLogout = async () => { // Make the function async
//		  console.log('Logging Out');

		  try {
			// Call the Flask logout endpoint using axios with the dynamic base URL
			await axios.post(`${baseUrl}/logout`);

			// If the call is successful, clear the user state and local storage
			setSiteUser(null);
			setSiteIsLoggedIn(false);
			setSiteIsAdmin(false);
			setIdFromURL(false);
			setListingId(false);
			localStorage.removeItem('siteUser');
			localStorage.removeItem('siteIsAdmin');

//			console.log('Logout successful.');
		  } catch (error) {
			// Handle any errors that may occur during the axios call
			console.error('Logout failed:', error.response?.data?.message || error.message);
		  }
		};

	  // Create a `userJson` object with defaults to empty strings
	  const userJson = {
		first_name: siteUser?.first_name || '',
		last_name: siteUser?.last_name || '',
		email: siteUser?.email || '',
		phone: siteUser?.phone || '',
		admin: siteIsAdmin || false,
		userID: siteUser?.userID || null,
		listing_id: listingId || ''
	  };			  

	  return (
		<SiteAuthContext.Provider
		  value={{
			siteUser,
			siteIsLoggedIn,
			siteIsAdmin,
			siteLogin,
			siteSignup,
			siteLogout,
			siteLoading,
			siteListingIdFound,
			fetchListingId,
			idFromURL,
			userJson,
			syncStateWithBackend,
		  }}
		>
		  {!siteLoading && children}
		</SiteAuthContext.Provider>
	  );
	};

	//export default SiteAuthProvider;
