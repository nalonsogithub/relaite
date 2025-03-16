import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Default.module.css';
import LoginSignUp from './LoginSignUp'; // Import the LoginSignUp component

const Default = () => {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(localStorage.getItem('lastName') || '');
  const [phone, setPhone] = useState(localStorage.getItem('phone') || '');
  const [password, setPassword] = useState('');
  const [representedByAgent, setRepresentedByAgent] = useState(null);
  const [loginStatus, setLoginStatus] = useState('');
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  // Handle user login
  const handleLogin = async (loginType, email, phone, userId, password, firstName, answers) => {
    const check_status = await login(loginType, email, phone, userId, password, firstName, answers);
    setLoginStatus(check_status.message);
    if (check_status.success) {
      navigateToWelcome();
    } else {
      alert('Login failed.');
    }
  };

  // Handle user sign-up
  const handleSignup = async (loginType, firstName, lastName, email, phone, userId, password, answers, representedByAgent) => {
    if (!firstName || !representedByAgent) {
      alert('Please supply your name and whether you have a buyer\'s agent.');
      return;
    }
    const check_status = await login(loginType, email, phone, userId, password, firstName, answers, representedByAgent);
    setLoginStatus(check_status.message);
    if (check_status.success) {
      navigateToWelcome();
    } else {
      alert('Login failed.');
    }
  };

  // Navigate to the main Welcome page after login
  const navigateToWelcome = () => {
    navigate('/welcome');
  };

  return (
    <div className={styles.container}>
      <h1>Login</h1>
      
      {/* Include the LoginSignUp component */}
      <LoginSignUp
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        email={email}
        password={password}
        representedByAgent={representedByAgent}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setPhone={setPhone}
        setEmail={setEmail}
        setPassword={setPassword}
        setRepresentedByAgent={setRepresentedByAgent}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        loginStatus={loginStatus}
        setLoginStatus={setLoginStatus}
        userId={''}
        answers={answers}
      />
    </div>
  );
};

export default Default;
