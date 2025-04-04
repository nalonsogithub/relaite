import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
//import { useAuth } from '../contexts/AuthContext';
import { useSiteAuth } from '../contexts/SiteAuthContext'; // Use SiteAuthContext for    authentication
import { ListingDetailsContext } from '../contexts/ListingDetailsContext';
import { useCarouselImages } from '../contexts/SiteCarouselContext';
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import styles from '../styles/WelcomePage.module.css';
import axios from 'axios';
import styled from 'styled-components';
import StaticButtonGame from './StaticButtonGame';
import RenderImageBubbleGame from './RenderImageBubbleGame';
import styles_bg from '../styles/CallBubbleGame.module.css';
import WelcomePageModal from './WelcomePageModal';
import SiteLoginSignUp from './SiteLoginSignUp';
import CorporateBanner from './CorporateBanner';

const base_url = 'https://aigentstorage.blob.core.windows.net/aigentstorage/REAL_ESTaiTE/';


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

function WelcomePage() {
  const [balloonQuestions, setBalloonQuestions] = useState([]);	
  const [user, setUser] = useState(null); // State to store user information
  const [isLogoImageOneLoaded, setIsLogoImageOneLoaded] = useState(true);
  const [isLogoImageTwoLoaded, setIsLogoImageTwoLoaded] = useState(true); 
  const [defaultListing, setDefaultListing] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loginStatus, setLoginStatus] = useState("");
  const { listingDetails } = useContext(ListingDetailsContext);
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(localStorage.getItem('lastName') || '');
  const [phone, setPhone] = useState(localStorage.getItem('phone') || '');
  const [password, setPassword] = useState('');
  const [representedByAgent, setRepresentedByAgent] = useState(null);
  const { listingJson, imageURL } = useContext(ListingAdminContext);
	

  const navigate = useNavigate();
  const [view, setView] = useState('questions'); // questions, anonymous, signup, signin
  const [userId, setUserId] = useState('');
  const { 
    context_chatLog, 
    context_addMessageToChatLog, 
    context_systemPrompt, 
    context_setSystemPrompt, 
    context_userPrompt, 
    context_setUserPrompt, 
    context_chatId, 
    context_setChatId, 
    context_questionId, 
    context_setQuestionId, 
    context_siteLocation, 
    context_setSiteLocation, 
    context_ConvoTop, 
    context_setConvoTop, 
    context_showUser, 
    context_setShowUser, 
    context_showAgent, 
    context_setShowAgent, 
    context_context, 
    context_setContext,
    context_listing_id,        
    context_set_listing_id,
	context_logUserInteraction
  } = useChat();	


  // Handle Login From Site Auth Context 	
  const {siteUser,
        siteIsLoggedIn,
	    siteIsAdmin,
        siteLogin,
        siteSignup,
        siteLogout,
        siteLoading,
		userJson} = useSiteAuth([])

  
  const [isModalOpen, setIsModalOpen] = useState(!siteIsLoggedIn); // Modal opens on page load
  const [showButton, setShowButton] = useState(false); // State to manage the button visibility	
  const [navPrompt, setNavPrompt] = useState(''); // State to manage the button visibility	
	
  const { loadImageData, imagesLoaded } = useCarouselImages();
  const [carouselImages, setCarouselImages] = useState([]);
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  
  // Use effect to check when listingJson is available1
  useEffect(() => {
    if (listingJson) {
      setIsReadyToRender(true); // Set ready to render when listingJson is fetched
//      console.log('WELCOME PAGE listingJson', listingJson);
    }
  }, [listingJson]);	

  useEffect(() => {
      // Check if logos_1 exists in listingJson.agent
      if (listingJson?.agent?.logos_1?.image_file_name) {
          setIsLogoImageTwoLoaded(true);
      } else {
          setIsLogoImageTwoLoaded(false);
      }
  }, [listingJson]); // Re-run whenever listingJson updates


  useEffect(() => {
    if (userJson) {
//      console.log('userJson', userJson);
    }
  }, [userJson]);	

  useEffect(() => {
    if (isModalOpen) {
	  console.log('SETTING MOAL');
	  siteLogout();
	  context_setSystemPrompt('INTRO');
      context_setUserPrompt('Tell me abou the site');
      context_setQuestionId('OpenModal');
   	  context_logUserInteraction('Tell me abou the site', null, 'welcomePage', 'initial visit', null);
		
		
    }
  }, []);	


	
	
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowButton(true); 
  };	

  useEffect(() => {
    localStorage.setItem('email', email);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('phone', phone);
  }, [email, firstName, phone]);	
  
  const handleAnswerChange = (question, answer) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };
	
  const handleImageBubbleGameAnswersSelected = (question, answer) => {
	const action = null;
	const actionSource = null;
	const questionSource = 'imagebubblegame';
    context_logUserInteraction(question, answer, questionSource, action, actionSource);
  };
	

	
	
  const handleLogout = () => {
    siteLogout();
  };

  if (!listingJson) {
    return <div>JSON Loading...</div>;
  } else {
    console.log('listingJson', listingJson);
  }
  
  const navigateTo = (path) => {
    navigate(path);
  };
  const handleNavButtonClick = async (buttonName) => {
    if (buttonName === 'admin') {
      try {
        console.log('Listing ID reset successfully in parent component!');
        navigate('/admin-console');
      } catch (error) {
        console.error('Failed to reset the Listing ID:', error);
      }
    } else  {
		// Extract the carousel list from listingJson
		const carousel = listingJson.carousel || [];

		// Find the item with the lowest image_order
		const lowestOrderItem = carousel.reduce((lowest, item) => {
		  return (lowest === null || item.image_order < lowest.image_order) ? item : lowest;
		}, null);

		// Set the homeSystemPrompt to the image_click_system_prompt of the lowest order item
		const homeSystemPrompt = lowestOrderItem ? lowestOrderItem.image_click_system_prompt : '';

		console.log('homeSystemPrompt:', homeSystemPrompt);		
	    context_setSystemPrompt(homeSystemPrompt);
        context_setUserPrompt('Please provide me some details on this home');
        context_setQuestionId('Home');
	    context_setSiteLocation('image detail');
	    context_setConvoTop('');
        navigate('/WrapperWithCarouselAndBinImageQGame');
		
    }
  };  

  const navigateToCarousel = () => {
    const userType = user && user.type ? user.type : '0';
    navigate('/MainCarouselWrapper', { state: { userType } });
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };
	
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };	
	
  if (!isReadyToRender) {
    return <div>Loading...</div>;
  }	
	

  return (
	  <div className={styles.pageWrapper}>	
      	{/* Show modal if user is not logged in */}
	  	{isModalOpen && !siteIsLoggedIn ? (
        	<WelcomePageModal
          		isOpen={isModalOpen}
	  			onClose={handleCloseModal}
          		chatLog={[]}  
          		collapseCarousel={() => {}}  
          		showFull={false}  
          		isModal={true}
          		showLabels={false}
        	/>
      	) : (
      	<>		  
			<div className={styles.welcomeContainer} >
		  		<div className={styles.CorporateBannerContainer}>
		    		<CorporateBanner
						title = "Open House AIgent"
						url=""
						marqueeText="Welcome to the Open House AIgent!"
					/>
		  		</div>
		
		  		<div className={styles.centeredContainer}>
		  			<div className={styles.welcomelogoContainer}>
		  				<div className={styles.logoContainerLeft}>
						{isLogoImageOneLoaded && (
							<img
					  			src={
		  							imageURL +
									listingJson.listing.master_listing_id.toLowerCase() + // Ensure lowercase conversion
									'/' +  // Add a slash between listing_id and image_file_name
//									listingJson.agent.images_0.image_file_name
									listingJson.agent.logos_0.image_file_name
					  			}
					  			alt="Logo"
					  			className={styles.logoImage}
					  			onLoad={() => setIsLogoImageOneLoaded(true)}
					  			onError={() => setIsLogoImageOneLoaded(false)}
							/>
				  		)}
						</div>
						<div className={styles.logoContainerRight}>
						{isLogoImageTwoLoaded && (
							<img
						 		src={
									imageURL +
									listingJson.listing.master_listing_id.toLowerCase() + // Ensure lowercase conversion
									'/' +  // Add a slash between listing_id and image_file_name
//									listingJson.agent.images_1.image_file_name
									listingJson.agent.logos_1.image_file_name
					  			}		
					  			alt="Second Logo"
					  			className={styles.logoImage}
					  			onLoad={() => setIsLogoImageTwoLoaded(true)}
					  			onError={() => setIsLogoImageTwoLoaded(false)}
							/>
				  		)}
						</div>
					</div>	  
					<div className={styles.welcomeimageContainer}>
						<img className={styles.welcomestyledImage} 
							src={
								imageURL +
								listingJson.listing.master_listing_id.toLowerCase() + 
								'/' +  
								listingJson.listing.images_0.image_file_name
				  			}
			  			alt="Home" />
						<div className={styles.infoBoxContainer}>
							<p className={styles.infoText}>
								<strong>Agent:</strong> {listingJson.agent.listing_agent_name}
							</p>
							<p className={styles.infoText}>
								<strong>Adrress:</strong> {listingJson.listing.listing_details.listing_address}
							</p>
							<p className={styles.infoText}>
								<strong>Description:</strong> {listingJson.listing.listing_details.listing_description}
							</p>
						</div>
					</div>
				</div>    

				{/* IMAGE BUBBLE CONTAINER */}
				<div className={'styles.bubbleGameContainer'} >
					<div className={styles.cbg_mainContainer}>
						<section className={styles.cbg_gameSection}>
							<RenderImageBubbleGame onImageBubbleGameAnswersSelected={handleImageBubbleGameAnswersSelected} />
						</section>
					</div>
				</div>

				{/* SIGNUP CONTAINER */}
				<div className={styles.loginSignupContainer}>
					<SiteLoginSignUp 
						initialView="signup" 
						onNavButtonClick={handleNavButtonClick}
						navButtonName="Enter" 
					/>
				</div>
			</div>
		</>
		)}
   	</div>
  );
};


export default WelcomePage;
