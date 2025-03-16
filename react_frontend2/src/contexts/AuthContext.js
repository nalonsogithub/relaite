import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from './ChatContext';
//import { useImages } from './CarouselImageContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAgent, setIsAgent] = useState(false); 
    const [userID, setUserID] = useState(false); 
    const IDLE_TIMEOUT = 15 * 60 * 1000; // 5 minutes
    const [lastActivity, setLastActivity] = useState(Date.now());

    const navigate = useNavigate();
    const { resetChatLog } = useChat();


    const resetState = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsAgent(false);
        setUserID(null);
        sessionStorage.clear();
        if (resetChatLog) resetChatLog();
        navigate('/LandingPage');
    };	
	
    const syncStateWithBackend = async () => {
        try {
            const response = await fetch('api/check-login', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setIsLoggedIn(data.isLoggedIn);
                setIsAdmin(data.isAdmin);
                setIsAgent(data.isAgent);
                setUserID(data.user_id);
            } else {
                resetState();
            }
        } catch (error) {
            console.error('Failed to sync state with backend:', error);
            resetState();
        }
    };	
	
	const logout = useCallback(async () => {
		try {
			const response = await fetch('api/logout', {
				method: 'POST',
				credentials: 'include',
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					console.log('Logout successful:', data.message || 'User logged out.');
					resetState();
				} else {
					console.warn('Logout response received, but no success:', data.message || 'Unknown issue.');
					resetState(); // Optionally still reset state for frontend cleanup
				}
			} else {
				console.error('Logout failed with status:', response.status, response.statusText);
				alert('Logout failed. Please try again.');
			}
		} catch (err) {
			console.error("Logout request failed:", err);
			alert('Network error during logout. Please try again.');
		}
	}, [resetChatLog, navigate]);
	
//    const logout = useCallback(async () => {
//        try {
//            const response = await fetch('api/logout', {
//                method: 'POST',
//                credentials: 'include',
//            });
//            if (response.ok) {
//                resetState();
//            }
//        } catch (err) {
//            console.error("Logout failed:", err);
//        }
//    }, [resetChatLog, navigate]);
	
//    const logout = useCallback(() => {
//        fetch('api/logout', {
//            method: 'POST',
//            credentials: 'include',
//        })
//        .then(res => res.json())
//        .then(data => {
//            if (data.success) {
//                resetState();
//                navigate('/WelcomePage'); 
//            }
//        })
//        .catch(err => console.error("Logout failed:", err));
//    }, [navigate, resetChatLog]);

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

//    useEffect(() => {
//        fetch('api/check-login', {
//            credentials: 'include'
//        })
//        .then(res => res.json())
//        .then(data => {
//            setIsLoggedIn(data.isLoggedIn);
//            setIsAdmin(data.isAdmin);
//            setIsAgent(data.isAgent);
//            setUserID(data.user_id);
//        })
//        .catch(err => console.error("Error checking login status:", err));
//    }, []);
	
	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				const response = await fetch('api/check-login', { credentials: 'include' });
				if (response.ok) {
					const data = await response.json();
					setIsLoggedIn(data.isLoggedIn);
					setIsAdmin(data.isAdmin);
					setIsAgent(data.isAgent);
					setUserID(data.user_id);
				} else {
					// Handle expired session or unauthorized access
					resetState();
				}
			} catch (err) {
				console.error("Error checking login status:", err);
				resetState();
			}
		};
		checkLoginStatus();
	}, [navigate]);
	
	

    const login = async (loginType, email, phone, userID, password, answers) => {
        const baseUrl = (() => {
            const hostname = window.location.hostname;
            if (hostname === 'localhost') {
                return 'http://localhost:5000/api';
            } else if (hostname === 'www.aigentTechnologies.com') {
                return 'https://www.aigentTechnologies.com/api';
            } else if (hostname === 'www.openhouseaigent.com') {
                return 'https://www.openhouseaigent.com/api';
            } else {
                return 'https://hbb-zzz.azurewebsites.net/api'; // Default URL if no match
            }
        })();

        try {
            const response = await fetch(`${baseUrl}/login_new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login_type: loginType, email, phone, user_id: userID, password, answers }),
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setIsAdmin(data.admin);
                setIsAgent(data.agent);
				setUserID(data.user_id)
                return { success: true, message: data.message, admin: data.admin, agent: data.agent, user_id: data.user_id };
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);
                setIsAgent(false);
                setUserID(false);
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login request failed', error);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setIsAgent(false);
            setUserID(false);
            return { success: false, message: error.message || 'An error occurred during login' };
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isAdmin, isAgent, userID, login, logout, syncStateWithBackend }}>
            {children}
        </AuthContext.Provider>
    );
};
