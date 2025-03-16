import React, { useState, useContext, useEffect } from 'react';
import { useSiteAuth } from '../contexts/SiteAuthContext'; // Use SiteAuthContext for authentication
import styles from '../styles/SiteLoginSignUp.module.css';
import axios from 'axios';
//import { useNavigate } from 'react-router-dom';
import { ListingAdminContext } from '../contexts/ListingAdminContext';


const SiteLoginSignUp = ({ initialView = 'login', onNavButtonClick, navButtonName}) => {
//  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(initialView);
//  const { siteLogin, siteSignup, siteLogout, siteIsLoggedIn, siteUser } = useSiteAuth();
  // Handle Login From Site Auth Context 	
  const {siteUser,
        siteIsLoggedIn,
	    siteIsAdmin,
        siteLogin,
        siteSignup,
        siteLogout,
        siteLoading,
		userJson,
		setSiteIsLoggedIn} = useSiteAuth([])
  
  useEffect(() => {
    if (userJson) {
      console.log('userJson', userJson);
    }
  }, [userJson]);	
  
  
  const [isSiteSignUp, setIsSiteSignUp] = useState(initialView === 'signup');
  const [isAnonSignup, setIsAnonSignup] = useState(false); // State to track anonymous signup
  const [siteIsForgotPassword, setSiteIsForgotPassword] = useState(false);
	
  const [siteEmail, setSiteEmail] = useState('');
  const [sitePassword, setSitePassword] = useState('');
  const [siteConfirmPassword, setSiteConfirmPassword] = useState('');
  const [siteFirstName, setSiteFirstName] = useState('');
  const [siteLastName, setSiteLastName] = useState('');
  const [sitePhone, setSitePhone] = useState('');
  const [siteRepresentedByAgent, setSiteRepresentedByAgent] = useState(''); // Default to empty string
  const [siteLoginStatus, setSiteLoginStatus] = useState('');
  const { resetListingId } = useContext(ListingAdminContext);

  // Function to generate a random string (used for anonymous user ID and password)
  const generateRandomString = (length) => {
    return Math.random().toString(36).substring(2, 2 + length);
  };

  // Utility function to validate email format
  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };	
  // Handle Enter key press to submit the form
  const handleKeyPress_SU = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default Enter key behavior
      handleSubmit(); // Call the handleSubmit function
    }
  };
	
	const handleSubmit = async () => {
	  let response;

	  // Anonymous Signup Logic
	  if (isAnonSignup) {
		if (!siteEmail && (!siteFirstName || !siteLastName)) {
		  setSiteLoginStatus('Please provide either an email address or both first and last name.');
		  return;
		}

		if (siteEmail && !isValidEmail(siteEmail)) {
		  setSiteLoginStatus('Please enter a valid email address.');
		  return;
		}

		// Validate if the buyer's agent question is answered
		if (!siteRepresentedByAgent) {
		  setSiteLoginStatus('Please indicate if you are represented by a buyer\'s agent');
		  return;
		}

		// Generate anonymous credentials
		const anonUserId = generateRandomString(8);
		const anonPassword = generateRandomString(12);

		// Signup request
		response = await siteSignup({
		  first_name: siteFirstName || 'Anonymous',
		  last_name: siteLastName || '',
		  email: siteEmail || `${anonUserId}@anon.com`,
		  phone: sitePhone,
		  password: anonPassword,
		  represented_by_agent: siteRepresentedByAgent,
		  anon: 1, // Indicate anonymous signup
		});
		  
        if (response.success) {
            console.log('Anonymous Signup successful!');
            setSiteLoginStatus('Anonymous Signup successful!');
            // Treat the anonymous user as logged in
            setIsAnonSignup(true); // State tracking anonymous user
            onNavButtonClick('loggedin'); // Navigate after success
        } else {
            setSiteLoginStatus(response.message || 'Anonymous Signup failed.');
        }
		  
	  } 
	  // Regular Signup Logic
	  else if (isSiteSignUp) {
		if (sitePassword !== siteConfirmPassword) {
		  setSiteLoginStatus('Passwords do not match');
		  return;
		}

		if (!siteRepresentedByAgent) {
		  setSiteLoginStatus('Please indicate if you are represented by a buyer\'s agent');
		  return;
		}

		response = await siteSignup({
		  first_name: siteFirstName,
		  last_name: siteLastName,
		  email: siteEmail,
		  phone: sitePhone,
		  password: sitePassword,
		  represented_by_agent: siteRepresentedByAgent,
		  anon: 0, // Non-anonymous user
		});

		console.log(response.message || 'Signup successful!');
		setSiteLoginStatus(response.message || 'Signup successful!');
	  } 
	  // Login Logic
	  else {
		response = await siteLogin(siteEmail, sitePassword);
		console.log(response.message || 'Login successful!');
		setSiteLoginStatus(response.message || 'Login successful!');
	  }

	  // Handle post-response actions
	  if (response.success) {
		console.log('Login/Signup successful!');
		setSiteLoginStatus('Login/Signup successful!');
		onNavButtonClick('loggedin');
		setSiteIsLoggedIn(true);
	  } else {
		console.log(response.message || 'Operation failed.');
		setSiteLoginStatus(response.message || 'Operation failed.');
	  }
	};

	const resetSignupState = () => {
		setIsSiteSignUp(false);
  		setIsAnonSignup(false);
	};

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('/api/siteforgotpassword', { email: siteEmail });
      setSiteLoginStatus(response.data.message);
    } catch (error) {
      setSiteLoginStatus('Error: ' + error.response.data.message);
    }
  };
  // Handle Logout
  const handleLogout = () => {
    siteLogout();
    setSiteLoginStatus('You have successfully logged out.');
  };
	
// Handle Navigation to Admin Console
const handleAdminNavigate = async () => {
  try {
    await resetListingId(); // Call the reset function from the context
	console.log('Listing ID reset successfully!');
	  
    // Call onNavButtonClick with 'admin' after the reset is complete
    if (onNavButtonClick) {
      onNavButtonClick('admin');
    }	  
  } catch (error) {
    console.error('Failed to reset the Listing ID:', error);
  }
};	

	
const handleNavButtonClick = async () => {
  try {
    if (onNavButtonClick) {
      onNavButtonClick(navButtonName);
    }	  
  } catch (error) {
    console.error('Failed to reset the Listing ID:', error);
  }
};	
	
	
  return (
    <div className={styles.siteContainer}>
      <div className={styles.siteFormBox} onKeyDown={handleKeyPress_SU}>
	  
        {/* Render logout view if user is logged in */}
        {siteIsLoggedIn ? (
          <div>
            <h2>Welcome, {userJson?.first_name || ''}!</h2>
            <p>You're currently logged in. Would you like to log out?</p>
	  
            {/* Container for Logout and Additional Navigation Button */}
            <div className={styles.navButtonContainer}>
              <button onClick={handleLogout} className={styles['back-button']}>
                Log Out
              </button>

              {/* Conditionally render navigation button if `navRoute` and `navButtonName` are provided */}
              {navButtonName && onNavButtonClick && (
                <button onClick={onNavButtonClick} className={styles['back-button']}>
                  {navButtonName}
                </button>
              )}
            </div>	  
            <div className={styles.navButtonContainer}>

              {/* Conditionally render "Admin Console" button if user is an admin */}
              {siteIsAdmin && (
                <button onClick={handleAdminNavigate} className={styles['back-button']}>
                  Admin Console
                </button>
              )}
            </div>	  
			  
          </div>
        ) : (
	  	  <>
			<h2>{siteIsForgotPassword ? 'Forgot Password' : isSiteSignUp ? 'Sign Up' : 'Login'}</h2>

			{siteIsForgotPassword ? (
			  <>
				<input
				  type="email"
				  placeholder="Enter your email to reset password"
				  value={siteEmail}
				  onChange={(e) => setSiteEmail(e.target.value)}
				  className={styles.siteInputField}
				/>
				<button onClick={handleForgotPassword} className={styles.siteSubmitButton}>Send Reset Link</button>
			  </>
			) : (
			  <>
				{isSiteSignUp || isAnonSignup ? (
				  <>
					<input
					  type="text"
					  placeholder="First Name"
					  value={siteFirstName}
					  onChange={(e) => setSiteFirstName(e.target.value)}
					  className={styles.siteInputField}
					/>
					<input
					  type="text"
					  placeholder="Last Name"
					  value={siteLastName}
					  onChange={(e) => setSiteLastName(e.target.value)}
					  className={styles.siteInputField}
					/>
				  </>
				) : null}

				<input
				  type="email"
				  placeholder="Email"
				  value={siteEmail}
				  onChange={(e) => setSiteEmail(e.target.value)}
				  className={styles.siteInputField}
				/>

				{!isAnonSignup && (
				  <input
					type="password"
					placeholder="Password"
					value={sitePassword}
					onChange={(e) => setSitePassword(e.target.value)}
					className={styles.siteInputField}
				  />					
				)}

				{isSiteSignUp && (
				  <>
					<input
					  type="password"
					  placeholder="Confirm Password"
					  value={siteConfirmPassword}
					  onChange={(e) => {
						setSiteConfirmPassword(e.target.value);
						if (sitePassword !== e.target.value) {
						  setSiteLoginStatus('Passwords do not match');
						} else {
						  setSiteLoginStatus(''); // Clear the status if they match
						}
					  }}
					  className={styles.siteInputField}
					/>
					<input
					  type="tel"
					  placeholder="Phone (optional)"
					  value={sitePhone}
					  onChange={(e) => setSitePhone(e.target.value)}
					  className={styles.siteInputField}
					/>

				  </>
				)}
				{isSiteSignUp || isAnonSignup ? (
				  <>
					<div className={styles.siteRadioGroup}>
					  <label className={styles.siteInstruction}>Are you represented by a buyer's agent?</label>
					  <div className={styles.siteRadioContainer}>
						<div className={styles.siteRadioItem}>
						  <input
							type="radio"
							id="yes"
							name="buyerAgent"
							value="yes"
							checked={siteRepresentedByAgent === 'yes'}
							onChange={() => setSiteRepresentedByAgent('yes')}
						  />
						  <label htmlFor="yes">Yes</label>
						</div>
						<div className={styles.siteRadioItem}>
						  <input
							type="radio"
							id="no"
							name="buyerAgent"
							value="no"
							checked={siteRepresentedByAgent === 'no'}
							onChange={() => setSiteRepresentedByAgent('no')}
						  />
						  <label htmlFor="no">No</label>
						</div>
					  </div>
					</div>

				  </>
				) : null}


				<div className={styles.loginmessages}>
					{siteLoginStatus && <p className={styles.siteLoginStatus}>{siteLoginStatus}</p>}
				</div>

				<button onClick={handleSubmit} className={styles.siteSubmitButton}>
				  {isAnonSignup ? 'Anonymous Sign Up' : isSiteSignUp ? 'Sign Up' : 'Login'}
				</button>



				<p className={styles.siteToggleText}>
				  {isSiteSignUp ? 'Already have an account?' : 'Need to create an account?'}{' '}
					{/*
				  <span onClick={() => { setIsSiteSignUp(!isSiteSignUp); setIsAnonSignup(false); }}>
					{isSiteSignUp ? 'Login' : 'Sign Up'}
				  </span>
				  */}
					<span onClick={() => { resetSignupState(); setIsSiteSignUp(true); }}>
					  Sign Up
					</span>
					<span onClick={() => { resetSignupState(); setIsAnonSignup(true); }}>
					  Anonymous Signup
					</span>

				</p>

				<p className={styles.siteToggleText}>
				  Want to use the site anonymously?{' '}
				  <span onClick={() => { setIsAnonSignup(!isAnonSignup); setIsSiteSignUp(false); }}>
					{isAnonSignup ? 'Go Back to Regular Sign Up' : 'Anonymous Signup'}
				  </span>
				</p>
			  </>
			)}
		  </>
		)}
	  </div>
	</div>
  );
};

export default SiteLoginSignUp;
