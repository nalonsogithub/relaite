import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from './ChatContext';
import { useImages } from './CarouselImageContext';  // Adjust the import if necessary

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    const [lastActivity, setLastActivity] = useState(Date.now());

    const navigate = useNavigate(); // Get the navigate function from react-router-dom
    const { resetChatLog } = useChat();
    const { resetImages } = useImages();

    const resetState = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        sessionStorage.clear();
        resetChatLog();
        resetImages();
        // Add any other state resets here if needed
    };

    const logout = useCallback(() => {
        fetch('api/logout', {
            method: 'POST',
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                resetState(); // Ensure all states are reset
                console.log('Successfully Logged Out');
                navigate('/welcome'); // Navigate to the welcome page after logout
            }
        })
        .catch(err => console.error("Logout failed:", err));
    }, [navigate, resetChatLog, resetImages]);

    useEffect(() => {
        const handleActivity = () => setLastActivity(Date.now());

        // Add event listeners to reset the timer on user activity
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('click', handleActivity);

        const interval = setInterval(() => {
            if (Date.now() - lastActivity > IDLE_TIMEOUT && isLoggedIn) {
                logout(); // Automatically log out the user
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
        // Check login status when the app loads
        fetch('api/check-login', {
            credentials: 'include' // Important for sessions/Cookies
        })
        .then(res => res.json())
        .then(data => {
            setIsLoggedIn(data.isLoggedIn);
            setIsAdmin(data.isAdmin);  // Set the admin state
        })
        .catch(err => console.error("Error checking login status:", err));
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Necessary for sessions/Cookies
            });
            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setIsAdmin(data.admin);  // Set the admin state
                return { success: true }; // Indicate success
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);  // Ensure admin state is reset
                return { success: false, message: data.message || 'Login failed' }; // Provide failure message
            }
        } catch (error) {
            console.error('Login request failed', error);
            setIsLoggedIn(false);
            setIsAdmin(false);  // Ensure admin state is reset
            return { success: false, message: error.message || 'An error occurred during login' }; // Provide error message
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
