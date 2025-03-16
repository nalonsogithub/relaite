import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from './ChatContext';
import { useImages } from './CarouselImageContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [listingID, setListingID] = useState(null);
    const [isAdmin, setIsAdmin, isAgent, setIsAgent] = useState(false);
    const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    const [lastActivity, setLastActivity] = useState(Date.now());

    const navigate = useNavigate();
    const { resetChatLog } = useChat();
    const { resetImages } = useImages();

    const resetState = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        sessionStorage.clear();
        if (resetChatLog) resetChatLog();
        if (resetImages) resetImages();
    };

    const logout = useCallback(() => {
        fetch('api/logout', {
            method: 'POST',
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                resetState();
                console.log('Successfully Logged Out');
                navigate('/WelcomePage'); // Navigate to the welcome page after logout
            }
        })
        .catch(err => console.error("Logout failed:", err));
    }, [navigate, resetChatLog, resetImages]);

    useEffect(() => {
        const handleActivity = () => setLastActivity(Date.now());

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('click', handleActivity);

        const interval = setInterval(() => {
            if (Date.now() - lastActivity > IDLE_TIMEOUT && isLoggedIn) {
                logout();
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('click', handleActivity);
        };
    }, [lastActivity, isLoggedIn, logout]);

    useEffect(() => {
        fetch('api/check-login', {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            setIsLoggedIn(data.isLoggedIn);
            setIsAdmin(data.isAdmin);
			setListingID(data.listing_id);
        })
        .catch(err => console.error("Error checking login status:", err));
    }, []);

    const login = async (loginType, email, phone, userId, password, answers) => {

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
		
		
        try {
            const response = await fetch(`${baseUrl}/login_new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login_type: loginType, email, phone, user_id: userId, password, answers }),
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setIsAdmin(data.admin);
                setIsAdmin(data.agent);
                return { success: true, message: data.message };
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);
				setIsAgent(false);
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login request failed', error);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setIsAgent(false);
            return { success: false, message: error.message || 'An error occurred during login' };
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isAdmin, isAgent, login, logout, listingID }}>
            {children}
        </AuthContext.Provider>
    );
};
