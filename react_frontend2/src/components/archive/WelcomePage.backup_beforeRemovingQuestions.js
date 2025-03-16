import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions, QuestionProvider } from '../contexts/questionContext';
import styles from '../styles/WelcomePage.module.css';
import axios from 'axios';
import styled from 'styled-components';
import FloatingQuestionGame from './FloatingQuestionGame';
import { useChat } from '../contexts/ChatContext';
import QuestionGameContainer from './QuestionGameContainer';

const base_url = 'https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/';

const sampleQuestionsList = [
  {
    question: 'What are your favorite colors?',
    answers: ['Red', 'Blue', 'Pink', 'Brown', 'Gold', 'Orange', 'Red2', 'Blue2', 'Pink2', 'Brown2', 'Gold2', 'Orange2'],
    required_responses: 3
  },
  {
    question: 'What are your favorite fruits?',
    answers: ['Apple', 'Banana', 'Orange', 'Strawberry', 'Grapes'],
    required_responses: 2
  },
  {
    question: 'What are your favorite hobbies?',
    answers: ['Reading', 'Gaming', 'Hiking', 'Swimming', 'Drawing'],
    required_responses: 3
  }
];

const balloonImages = [
  `${base_url}red_balloon.gif`,
  `${base_url}magenta_balloon.gif`,
  `${base_url}pink_balloon.gif`,
  `${base_url}purple_balloon.gif`,
  `${base_url}darkblue_balloon.gif`,
  `${base_url}aqua_balloon.gif`,
  `${base_url}brightgreen_balloon.gif`,
  `${base_url}limegreen_balloon.gif`,
  `${base_url}goldenbrown_balloon.gif`,
  `${base_url}yellow_balloon.gif`,
  `${base_url}lightgreen_balloon.gif`,
  `${base_url}lightblue_balloon.gif`,
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
            return 'https://https://hbb-zzz.azurewebsites.net//api'; // Default URL if no match
          }
       })();		

  
    axios.get(`${baseUrl}/listing-details`)
      .then(response => {
        setListingDetails(response.data.listingDetails);
        setDefaultListing(response.data.defaultListing.default_listing);
		setListingID(response.data.listingID);
      })
      .catch(error => console.error('Failed to fetch listing details', error));
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin('known', email, phone, userId, password, firstName);
    }
  };	
	
  const handleLogin = async (loginType, email, phone, userId, password, firstName) => {

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
//      navigateToCarousel();
	  navigateToDetail();
    } else {
      alert('Login failed.');
    }
  };
	
	
  const handleLogout = () => {
    logout();
  };

  if (!listingDetails) {
    return <div>Loading...</div>; // Show a loading state while data is being fetched
  } 
  
  const navigateTo = (path) => {
    navigate(path);
  };
  const navigateToDetail = () => {
  	    setPrompt('Provide details on this home');
        setQuestion('Provide details on this home');
        setAssistant('Home');
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
		
        {isLoggedIn && listingID && (
            <React.Fragment>
               <p>Listing ID: {listingID}</p>
               <button onClick={() => navigate('/LCAgent', { state: { userType: '0' } })} className={styles.welcomelink}>LiveChat Agent</button>
               <button onClick={() => navigate('/LCClient', { state: { userType: '0' } })} className={styles.welcomelink}>LiveChat Client</button>
            </React.Fragment>
         )}		
      </div>


      <QuestionProvider questionType="entry">
        <QuestionsView handleAnswerChange={handleAnswerChange} />
      </QuestionProvider>



      <div className={styles.engadgingQuestionComponentView}>
        <div className={styles.engadgingQuestionDescriptionContainer}>
	      <h4>We value your feedback! If you have a moment, please answer a few questions to help us improve your experience.</h4>
          <div className={styles.logoContainerNoPadding}>
		    <img
			  src="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/REALESTATE_blue.png"
			  alt="Open House AIgent. A product from REAL ESTaiTE"
			  className={styles.logoImageNoPadding}
			/>
		  </div>
        </div>
	  </div>
      <div>
        <div className={'styles.questonGameContainer'} >
		 <FloatingQuestionGame 
			questionsList={sampleQuestionsList} 
			balloonImages={balloonImages} 
			numberOfContainers={3} 
			containerSize={1}
			wrapperHeight="500px"/>
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
			  <button onClick={() => handleLogin('known', email, phone, userId, password)} className={styles.signupButton}>Sign Up / Sign In</button>
			  <button onClick={() => handleLogin('anon', email, phone, null, null)} className={styles.proceedButton}>Anonymous</button>
		  </div>

        </div>
      </div>
      {loginStatus && <div className={styles.loginStatus}>{loginStatus}</div>}
    </div>
   </div>
  );
};

const QuestionsView = ({ handleAnswerChange }) => {
  const { questions, currentQuestionIndex, handleAnswerSelect } = useQuestions();

  const handleAnswerChangeInternal = (question, answer) => {
    handleAnswerChange(question, answer);
    handleAnswerSelect(question, answer);
  };

  return (
    <div className={styles.questionsView}>
      {questions.length > 0 && (
        <div className={styles.questionBox}>
		<div className={styles.questionDescriptionLogoContainer}>
		  <div className={styles.questionDescriptionContainer}>
			<h4>We value your feedback! If you have a moment, please answer a few questions to help us improve your experience.</h4>
		  </div>
		  <div className={styles.logoContainerNoPadding}>
			<img
			  src="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/REALESTATE_blue.png"
			  alt="Open House AIgent. A product from REAL ESTaiTE"
			  className={styles.logoImageNoPadding}
			/>
		  </div>
		</div>	  
         <h4>Question {currentQuestionIndex + 1} of {questions.length}</h4>
          <p>{questions[currentQuestionIndex].question}</p>
          <div className={styles.answersContainer}>
            {questions[currentQuestionIndex].answer_list.map(answer => (
              <div key={answer} className={styles.answerOption}>
                <label>
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={answer}
                    onChange={() => handleAnswerChangeInternal(questions[currentQuestionIndex].question, answer)}
                  />
                  {answer}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};





export default WelcomePage;
