import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
//		fetch(`${process.env.REACT_APP_API_URL2}api/check-login`, {

		// Check login status when the app loads	
        fetch('api/check-login', {
            credentials: 'include' // Important for sessions/Cookies
        })
        .then(res => res.json())
        .then(data => setIsLoggedIn(data.isLoggedIn))
        .catch(err => console.error("Error checking login status:", err));
    }, []);

	
	
	const login = async (email, password) => {
		try {
//			const response = await fetch(`${process.env.REACT_APP_API_URL2}api/login`, {
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
				return { success: true }; // Indicate success
			} else {
				setIsLoggedIn(false);
				return { success: false, message: data.message || 'Login failed' }; // Provide failure message
			}
		} catch (error) {
			console.error('Login request failed', error);
			setIsLoggedIn(false);
			return { success: false, message: error.message || 'An error occurred during login' }; // Provide error message
		}
	};

    const logout = () => {
		setIsLoggedIn(false);
        fetch('api/logout', {
//        fetch(`${process.env.REACT_APP_API_URL2}api/logout`, {
            method: 'POST',
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setIsLoggedIn(false);
				console.log('DEBUG: Clearing Session')
				sessionStorage.clear()
				console.log('Successfully Logged Out');
            }
        })
        .catch(err => console.error("Logout failed:", err));
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
