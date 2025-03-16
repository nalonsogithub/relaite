import React from 'react';
import styles from '../styles/WelcomePage.module.css';

const LoginSignUp = ({
  firstName,
  lastName,
  phone,
  email,
  password,
  representedByAgent,
  setFirstName,
  setLastName,
  setPhone,
  setEmail,
  setPassword,
  setRepresentedByAgent,
  handleLogin,
  handleSignup,
  loginStatus,
  userId,
  answers
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin('existing', email, phone, userId, password, answers);
    }
  };

  return (
    <div className={styles.infoBoxContainer}>
      {/* Sign-Up Section */}
      <div className={styles.infoBox}>
        <h4>Sign Up / Sign In</h4>
        <input
          type="text"
          placeholder="First Name"
          className={styles.inputField}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="name"
        />
        <input
          type="text"
          placeholder="Last Name"
          className={styles.inputField}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="name"
        />
        <input
          type="text"
          placeholder="Phone (optional)"
          className={styles.inputField}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />

        <input
          type="text"
          placeholder="Email"
          className={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Radio buttons for the buyer's agent question */}
        <div className={styles.bayn_radioGroup}>
          <label className={styles.bayn_instruction}>
            Are you represented by a buyer's agent?
          </label>
          <div className={styles.bayn_radioContainer}>
            <div className={styles.bayn_radioItem}>
              <input
                type="radio"
                id="yes"
                name="buyerAgent"
                value="yes"
                checked={representedByAgent === 'yes'}
                onChange={() => setRepresentedByAgent('yes')}
              />
              <label htmlFor="yes">Yes</label>
            </div>
            <div className={styles.bayn_radioItem}>
              <input
                type="radio"
                id="no"
                name="buyerAgent"
                value="no"
                checked={representedByAgent === 'no'}
                onChange={() => setRepresentedByAgent('no')}
              />
              <label htmlFor="no">No</label>
            </div>
          </div>
        </div>

        {/* Signup and Proceed buttons */}
        <div className={styles.signupButtonContainer}>
          <button
            onClick={() =>
              handleSignup(
                'known',
                firstName,
                lastName,
                email,
                phone,
                userId,
                password,
                answers,
                representedByAgent
              )
            }
            className={styles.signupButton}
          >
            Sign Up
          </button>
          <button
            onClick={() =>
              handleSignup(
                'anon',
                firstName,
                lastName,
                email,
                phone,
                null,
                null,
                answers,
                representedByAgent
              )
            }
            className={styles.proceedButton}
          >
            Name Only
          </button>
        </div>
      </div>

      {/* Sign-In Section */}
      <div className={styles.infoBox}>
        <h4>Sign In</h4>
        <input
          type="text"
          placeholder="Email"
          className={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.signupButtonContainer}>
          <button
            onClick={() => handleLogin('existing', email, phone, userId, password, answers)}
            className={styles.signupButton}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Login status message */}
      {loginStatus && <div className={styles.loginStatus}>{loginStatus}</div>}
    </div>
  );
};

export default LoginSignUp;
