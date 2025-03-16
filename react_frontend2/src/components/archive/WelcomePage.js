import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/WelcomePage.module.css';
import axios from 'axios';
import styled from 'styled-components';
import StaticButtonGame from './StaticButtonGame';
import RenderImageBubbleGame from './RenderImageBubbleGame';
import { useChat } from '../contexts/ChatContext';
//import QuestionGameContainer from './QuestionGameContainer';
// Will it work

const base_url = 'https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/';
const buttonImages = [
  `${base_url}buttons/MustardButton.png`,
  `${base_url}buttons/LimeGreenButton.png`,
  `${base_url}buttons/TealButton.png`,
  `${base_url}buttons/PinkButton.png`,
  `${base_url}buttons/PurpleButton.png`,
  `${base_url}buttons/OrangeButton.png`,
  `${base_url}buttons/MagentaButton.png`,
  `${base_url}buttons/YelloButton.png`,
  `${base_url}buttons/CyanButton.png`,
  `${base_url}buttons/BlueButton.png`,
  `${base_url}buttons/GreenButton.png`,
  `${base_url}buttons/RedButton.png`,
];


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
  const [listingDetails, setListingDetails] = useState(null);
  const [balloonQuestions, setBalloonQuestions] = useState([]);	
  const { isLoggedIn, isAdmin, isAgent, logout, login } = useAuth();
  const [user, setUser] = useState(null); // State to store user information
  const [isLogoImageOneLoaded, setIsLogoImageOneLoaded] = useState(true);
  const [isLogoImageTwoLoaded, setIsLogoImageTwoLoaded] = useState(true); 
  const [defaultListing, setDefaultListing] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loginStatus, setLoginStatus] = useState("");

	
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName') || '');
  const [phone, setPhone] = useState(localStorage.getItem('phone') || '');
  const [password, setPassword] = useState('');
	

  const navigate = useNavigate();
  const { carouselType, setCarouselType } = useChat();
  const [view, setView] = useState('questions'); // questions, anonymous, signup, signin
  const [userId, setUserId] = useState('');
  const { listingID, setListingID } = useChat();
  const { setChatId, setQuestion, setAssistant, setPrompt } = useChat();
	
  //   for balloon questons
//  const { questions, currentQuestionIndex, handleAnswerSelect } = useQuestions();
//  useEffect(() => {
//    console.log('Questions in WelcomePage:', questions);
//  }, [questions]);
//	
  useEffect(() => {
      const baseUrl = (() => {
        const hostname = window.location.hostname;
          if (hostname === 'localhost') {
            return 'http://localhost:5000/api';
          } else if (hostname === 'www.aigentTechnologies.com') {
            return 'https://www.aigentTechnologies.com/api';
          } else if (hostname === 'www.openhouseaigent.com') {
            return 'https://www.openhouseaigent.com/api';
          } else {
            return 'https://https://hbb-zzz.azurewebsites.net/api'; // Default URL if no match
          }
       })();		

  
    axios.get(`${baseUrl}/listing-details`)
      .then(response => {
        setListingDetails(response.data.listingDetails);
        setDefaultListing(response.data.defaultListing.default_listing);
		setListingID(response.data.listingID);
      })
      .catch(error => console.error('Failed to fetch listing details', error));
 
    axios.get(`${baseUrl}/get_information_questions?type=entry`)
      .then(response => {
        console.log('API response received');
        return response.data;
      })
      .then(data => {
        console.log('Data received from API:', data);

        if (!data || data.length === 0) {
          console.error('Invalid data structure:', data);
          return;
        }

        const parsedBalloonQuestions = data.map(q => ({
          question: q.question,
          answers: JSON.parse(q.answers),
          required_responses: q.required_responses,
          thank_you_message: q.thank_you_message
        }));
        console.log('Parsed balloonQuestions:', parsedBalloonQuestions);
        setBalloonQuestions(parsedBalloonQuestions);
      })
      .catch(error => {
        console.error('Error fetching balloonQuestions:', error);
      });	  
  }, []);
  
	
	
  useEffect(() => {
//    console.log('Updated defaultListing', defaultListing); // This will log the updated value after state changes
  }, [defaultListing]);

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
	
  const handleAnswersCollected = (collectedAnswers) => {
    setAnswers(collectedAnswers);
	console.log('answers selected', collectedAnswers);
  };
	
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin('known', email, phone, userId, password, firstName, answers);
    }
  };	
	
  const handleLogin = async (loginType, email, phone, userId, password, firstName, answers) => {

	console.log('ANSWERS:', answers);

	  
    const check_status = await login(loginType, email, phone, userId, password, firstName, answers);
    setLoginStatus(check_status.message); // Set the login status message
    if (check_status.success) {
      console.log(check_status, 'ADMIN', check_status.admin, 'AGENT', check_status.agent);
	  navigateToDetail();
    } else {
      alert('Login failed.');
    }
  };
  const handleSignup = async (loginType, email, phone, userId, password, firstName, answers) => {

	console.log('ANSWERS FROM SignUp:', answers);
	if (loginType !== 'anon') {
		if (!validateEmail(email)) {
		  alert('Please enter a valid email address.');
		  return;
		}
		if (!password) {
		  alert('Please enter a password.');
		  return;
		}	  
		
	}  
	  
	  
    const check_status = await login(loginType, email, phone, userId, password, firstName, answers);
    setLoginStatus(check_status.message); // Set the login status message
    if (check_status.success) {
      console.log(check_status, 'ADMIN', check_status.admin, 'AGENT', check_status.agent);
	  navigateToDetail();
    } else {
      alert('Login failed.');
    }
  };
	
	
  const handleLogout = () => {
    logout();
  };

  if (!listingDetails || balloonQuestions.length === 0) {
    return <div>Loading...</div>; // Show a loading state while data is being fetched
  } else {
//	  console.log('THEY ARE HERE', balloonQuestions);
  }
  
  const navigateTo = (path) => {
    navigate(path);
  };
  const navigateToDetail = () => {
  	    setPrompt('Provide details on this home');
        setQuestion('Provide details on this home');
        setAssistant('Home');
	    setCarouselType('main');
        navigate('/WrapperWithCarouselAndChatbot');
		setChatId('detail');	
  }

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

  return (
   <div className={styles.pageWrapper}>	  
    <div className={styles.welcomeContainer} style={{ background: 'white' }}>
      <div className={styles.centeredContainer}>
        {isAdmin && <p>You are an admin.</p>}
          <div className={styles.welcomelogoContainer}>
            <div className={styles.logoContainer}>
              {isLogoImageOneLoaded && (
                <img
                  src={listingDetails.logoImageOne}
                  alt="Logo"
                  className={styles.logoImage}
                  onLoad={() => setIsLogoImageOneLoaded(true)}
                  onError={() => setIsLogoImageOneLoaded(false)}
                />
              )}
            </div>
            <div className={styles.logoContainer}>
              {isLogoImageTwoLoaded && (
                <img

                  src={listingDetails.logoImageTwo}
                  alt="Second Logo"
                  className={styles.logoImage}
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
        {isLoggedIn && isAdmin && (
          <React.Fragment>
            <button onClick={() => navigateToCarousel()} className={styles.welcomelink}>Carousel</button>
            <button onClick={handleLogout} className={styles.welcomelink}>Logout</button>
            <button onClick={() => navigate('/manage_listing', { state: { userType: '0' } })} className={styles.welcomelink}>Manage Listing</button>
          </React.Fragment>
        )}
		
      </div>
      <div>
        <div className={'styles.questonGameContainer'} >
		 <StaticButtonGame 
			questionsList={balloonQuestions} 
			balloonImages={buttonImages} 
			numberOfContainers={5} 
			containerSize={1}
			wrapperHeight="500px"
			rightOffset={120}
			onAnswerSelected={handleAnswersCollected}/>
		</div>
      </div>

      <div className={styles.infoBoxContainer}>
        <div className={styles.infoBox}>
          <h4>Sign Up / Sign In</h4>
          <input 
            type="text" 
            placeholder="First Name (optional)" 
            className={styles.inputField} 
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
			autoComplete="name"
          />
          <input 
            type="text" 
            placeholder="Phone (optional)" 
            className={styles.inputField} 
            value={phone}
            onChange={e => setPhone(e.target.value)}
			autoComplete="tel"
          />
				
          <input 
            type="text" 
            placeholder="Email" 
            className={styles.inputField} 
            value={email}
            onChange={e => setEmail(e.target.value)}
			onKeyDown={handleKeyDown}
			autoComplete="email"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className={styles.inputField} 
            value={password}
            onChange={e => setPassword(e.target.value)}
			onKeyDown={handleKeyDown}
          />
		  <div className={styles.signupButtonContainer}>
			  <button onClick={() => handleSignup('known', email, phone, userId, password, answers)} className={styles.signupButton}>Sign Up</button>
			  <button onClick={() => handleSignup('anon', email, phone, null, null, answers)} className={styles.proceedButton}>Anonymous</button>
		  </div>

        </div>
      </div>
      <div className={styles.infoBoxContainer}>
        <div className={styles.infoBox}>
          <h4>Sign In</h4>
          <input 
            type="text" 
            placeholder="Email" 
            className={styles.inputField} 
            value={email}
            onChange={e => setEmail(e.target.value)}
			onKeyDown={handleKeyDown}
			autoComplete="email"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className={styles.inputField} 
            value={password}
            onChange={e => setPassword(e.target.value)}
			onKeyDown={handleKeyDown}
          />
		  <div className={styles.signupButtonContainer}>
			  <button onClick={() => handleLogin('existing', email, phone, userId, password, answers)} className={styles.signupButton}>Sign In</button>
		  </div>

        </div>
      </div>


      {loginStatus && <div className={styles.loginStatus}>{loginStatus}</div>}
    </div>
   </div>
  );
};


export default WelcomePage;
