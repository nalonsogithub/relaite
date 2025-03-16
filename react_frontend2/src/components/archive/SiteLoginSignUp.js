import React, { useState } from 'react';
import { useSiteAuth } from '../contexts/SiteAuthContext'; // Use SiteAuthContext for authentication
import styles from '../styles/SiteLoginSignUp.module.css';
import axios from 'axios';



const SiteLoginSignUp = () => {
  const { siteLogin, siteSignup } = useSiteAuth(); // Use the context-provided methods
  const [isSiteSignUp, setIsSiteSignUp] = useState(false);
  const [siteIsForgotPassword, setSiteIsForgotPassword] = useState(false);
  const [siteEmail, setSiteEmail] = useState('');
  const [sitePassword, setSitePassword] = useState('');
  const [siteConfirmPassword, setSiteConfirmPassword] = useState('');
  const [siteFirstName, setSiteFirstName] = useState('');
  const [siteLastName, setSiteLastName] = useState('');
  const [sitePhone, setSitePhone] = useState('');
  const [siteRepresentedByAgent, setSiteRepresentedByAgent] = useState('');
  const [siteLoginStatus, setSiteLoginStatus] = useState('');

  const handleSubmit = async () => {
    if (isSiteSignUp) {
      if (sitePassword !== siteConfirmPassword) {
        setSiteLoginStatus('Passwords do not match');
        console.log('Passwords do not match'); // Print to React console
        return;
      }
      if (!siteRepresentedByAgent) {
        setSiteLoginStatus('Please indicate if you are represented by a buyer\'s agent');
        console.log('Please indicate if you are represented by a buyer\'s agent'); // Print to React console
        return;
      }

      // Use the siteSignup function from SiteAuthContext 
      const response = await siteSignup({
        first_name: siteFirstName,
        last_name: siteLastName,
        email: siteEmail,
        phone: sitePhone,
        password: sitePassword,
        represented_by_agent: siteRepresentedByAgent,
      });

      console.log(response.message || 'Signup successful!'); // Print to console
      setSiteLoginStatus(response.message || 'Signup successful!');
    } else {
      // Use the siteLogin function from SiteAuthContext
      const response = await siteLogin(siteEmail, sitePassword);
      console.log(response.message || 'Login successful!'); // Print to console
      setSiteLoginStatus(response.message || 'Login successful!');
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('/api/siteforgotpassword', { email: siteEmail });
      setSiteLoginStatus(response.data.message);
    } catch (error) {
      setSiteLoginStatus('Error: ' + error.response.data.message);
    }
  };

  return (
    <div className={styles.siteContainer}>
      <div className={styles.siteFormBox}>
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
            {isSiteSignUp && (
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
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={sitePhone}
                  onChange={(e) => setSitePhone(e.target.value)}
                  className={styles.siteInputField}
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={siteEmail}
              onChange={(e) => setSiteEmail(e.target.value)}
              className={styles.siteInputField}
            />
            <input
              type="password"
              placeholder="Password"
              value={sitePassword}
              onChange={(e) => setSitePassword(e.target.value)}
              className={styles.siteInputField}
            />

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
            )}

            <button onClick={handleSubmit} className={styles.siteSubmitButton}>
              {isSiteSignUp ? 'Sign Up' : 'Login'}
            </button>
            <p className={styles.siteToggleText}>
              {isSiteSignUp ? 'Already have an account?' : 'Need to create an account?'}{' '}
              <span onClick={() => setIsSiteSignUp(!isSiteSignUp)}>{isSiteSignUp ? 'Login' : 'Sign Up'}</span>
            </p>
            {!isSiteSignUp && (
              <p className={styles.siteForgotPasswordText} onClick={() => setSiteIsForgotPassword(true)}>
                Forgot Password?
              </p>
            )}
          </>
        )}
      </div>
      {siteLoginStatus && <p className={styles.siteLoginStatus}>{siteLoginStatus}</p>}
    </div>
  );
};

export default SiteLoginSignUp;
