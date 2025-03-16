import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Welcome.module.css';
import axios from 'axios';
import styled from 'styled-components';
import { useChat } from '../contexts/ChatContext';

const ImageContainer = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const StyledImage = styled.img`
  max-width: 60%;
  height: auto;
  max-height: 400px; /* Adjust this value as needed */
  object-fit: cover;
`;

function Welcome() {
    // Destructure `user` along with `isLoggedIn` and `logout` from the useAuth hook
	const [listingDetails, setListingDetails] = useState(null);
    const { isLoggedIn, isAdmin, logout, user } = useAuth();
    const [isLogoImageOneLoaded, setIsLogoImageOneLoaded] = useState(true);
    const [isLogoImageTwoLoaded, setIsLogoImageTwoLoaded] = useState(true);	
	const [defaultListing, setDefaultListing] = useState(false);
    const navigate = useNavigate();
	const { carouselType, setCarouselType } = useChat();

	useEffect(() => {
		const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hbb-zzz.azurewebsites.net/api';
		axios.get(`${baseUrl}/listing-details`)
			.then(response => {
				setListingDetails(response.data.listingDetails);
				setDefaultListing(response.data.defaultListing.default_listing);
			})
			.catch(error => console.error('Failed to fetch listing details', error));
	}, []);
	
    useEffect(() => {
        console.log('Updated defaultListing', defaultListing); // This will log the updated value after state changes
    }, [defaultListing]);	
	
    const handleLogout = () => {
        logout();
    };

    if (!listingDetails) {
        return <div>Loading...</div>; // Show a loading state while data is being fetched
    }	
	
    const navigateTo = (path) => {
        navigate(path);
    };

    const navigateToCarousel = () => {
        // Assuming `user.type` exists, use it; otherwise, default to 'default'
        const userType = user && user.type ? user.type : '0'; // Check if `user` is defined and has a `type` property
		setCarouselType('main')
        navigate('/carousel-page', { state: { userType } });
    };

    return (
		<div className={styles.welcomeContainer} style={{ background: 'white' }}>
			<div className={styles.centeredContainer}>
		    	{isAdmin && <p>You are an admin.</p>}
        	<div className={styles.welcomelogoContainer}>
          		<div className={styles.welcomeleftLogo}>
            		{isLogoImageOneLoaded && (
              			<img
                			src={listingDetails.logoImageOne}
                			alt="Logo"
                			onLoad={() => setIsLogoImageOneLoaded(true)}
                			onError={() => setIsLogoImageOneLoaded(false)}
              			/>
            		)}
          		</div>
          		<div className={styles.welcomerightLogo}>
            		{isLogoImageTwoLoaded && (
              			<img
                			src={listingDetails.logoImageTwo}
                			alt="Second Logo"
                			onLoad={() => setIsLogoImageTwoLoaded(true)}
                			onError={() => setIsLogoImageTwoLoaded(false)}
              			/>
            		)}
          		</div>
        	</div>
        	<div className={styles.welcomeimageContainer}>
          		<img className={styles.welcomestyledImage} src={listingDetails.listingImage} alt="Home" />
          		<p>Agent: {listingDetails.listing_agent_name}</p>
          		<p>Description: {listingDetails.listing_description}</p>
        	</div>
      		</div> 		
            	<div className={styles.welcomebuttonContainer} style={{ textAlign: 'center' }}>
                	{!isLoggedIn ? (
                    	<React.Fragment>
                        	<button onClick={() => navigate('/login')} className={styles.welcomelink}>Login</button>
                        	<button onClick={() => navigate('/signup')} className={styles.welcomelink}>Sign Up</button>
							{isAdmin && 
							<button onClick={() => navigate('/manage_listing', { state: { userType: '0' } })} className={styles.welcomelink}>Add Listing</button>}
                    	</React.Fragment>
                	) : (
                    	<React.Fragment>
                        	<button onClick={() => navigateToCarousel()} className={styles.welcomelink}>Carousel</button>
                        	<button onClick={handleLogout} className={styles.welcomelink}>Logout</button>
							{isAdmin && 
							<button onClick={() => navigate('/manage_listing', { state: { userType: '0' } })} className={styles.welcomelink}>Manage Listing</button>}
                    	</React.Fragment>
                	)}
            	</div>
        	</div>
    );
}

export default Welcome;
